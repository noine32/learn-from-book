# learn-from-book excel-vba runner (Windows-only, Excel COM).
# Creates a NEW Excel instance, imports the .bas module, runs each case via
# Application.Run, and compares results against cases.json.
# It never touches other Excel instances: it cleans up only the instance it created.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File run.ps1 -BasFile <impl.bas> -CasesFile <cases.json>
# Output: ALL_PASS / SOME_FAIL / ERROR:... ; exit 0 (all match) / 1 (mismatch or error).
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$BasFile,
  [Parameter(Mandatory = $true)][string]$CasesFile
)
$ErrorActionPreference = 'Stop'

$excel = $null
$wb = $null
$excelPid = 0
$allPass = $true
try {
  $basPath = (Resolve-Path -LiteralPath $BasFile).Path
  $cases = Get-Content -Raw -LiteralPath $CasesFile | ConvertFrom-Json
  $fn = [string]$cases.fn

  # Snapshot existing Excel PIDs so we can identify only the one we create.
  $pidsBefore = @(Get-Process EXCEL -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)

  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  Start-Sleep -Milliseconds 200
  $pidsAfter = @(Get-Process EXCEL -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
  $excelPid = ($pidsAfter | Where-Object { $pidsBefore -notcontains $_ } | Select-Object -First 1)

  $wb = $excel.Workbooks.Add()
  # Requires "Trust access to the VBA project object model" (AccessVBOM) enabled.
  $wb.VBProject.VBComponents.Import($basPath) | Out-Null

  foreach ($c in $cases.cases) {
    $callArgs = New-Object System.Collections.ArrayList
    [void]$callArgs.Add($fn)
    foreach ($a in @($c.args)) { [void]$callArgs.Add($a) }
    $actual = $excel.GetType().InvokeMember('Run', [System.Reflection.BindingFlags]::InvokeMethod, $null, $excel, $callArgs.ToArray())
    if ("$actual" -ne "$($c.expect)") {
      $allPass = $false
      Write-Output ("FAIL fn={0} args={1} expect={2} actual={3}" -f $fn, ($c.args -join ','), $c.expect, $actual)
    }
  }
  if ($allPass) { Write-Output 'ALL_PASS' } else { Write-Output 'SOME_FAIL' }
}
catch {
  $allPass = $false
  Write-Output ("ERROR: " + $_.Exception.Message)
}
finally {
  if ($null -ne $wb) { try { $wb.Close($false) | Out-Null } catch {} }
  if ($null -ne $excel) { try { $excel.Quit() } catch {} }
  if ($null -ne $wb) { try { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) } catch {} }
  if ($null -ne $excel) { try { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) } catch {} }
  $wb = $null
  $excel = $null
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  # Last-resort: if our own instance survived, kill only that PID (never other Excel).
  if ($excelPid) {
    $p = Get-Process -Id $excelPid -ErrorAction SilentlyContinue
    if ($null -ne $p -and $p.ProcessName -eq 'EXCEL') { Stop-Process -Id $excelPid -Force -ErrorAction SilentlyContinue }
  }
}
if ($allPass) { exit 0 } else { exit 1 }
