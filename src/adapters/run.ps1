# learn-from-book excel-vba runner (Windows-only, Excel COM). ASCII comments only.
# Creates a NEW Excel instance, imports the .bas module, runs each case.
# Cleans up only the instance it created (never touches other Excel instances).
#
# cases.json schema (setup / expect / expectCells / expectArray are optional):
#   { "fn": "<name>", "cases": [ {
#       "setup":       { "A1": 10, "A2": 20 },          # write cell values first
#       "args":        [ 5, { "range": "A1" }, [1,2] ], # scalar / Range ref / array (Variant array)
#       "expect":      50,                               # expected scalar return
#       "expectCells": { "B1": "done" },                # expected cell values after run (side effects)
#       "expectArray": [1, 2, 3]                         # expected 1D array return (order-sensitive)
#   } ] }
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File run.ps1 -BasFile <impl.bas> -CasesFile <cases.json>
# Output: ALL_PASS / SOME_FAIL / ERROR:... ; exit 0 (all match) / 1 (mismatch or error).
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$BasFile,
  [Parameter(Mandatory = $true)][string]$CasesFile
)
$ErrorActionPreference = 'Stop'

function Test-HasProp($obj, $name) {
  return ($null -ne $obj) -and ($null -ne $obj.PSObject.Properties[$name])
}

$excel = $null
$wb = $null
$excelPid = 0
$allPass = $true
try {
  $basPath = (Resolve-Path -LiteralPath $BasFile).Path
  $cases = Get-Content -Raw -LiteralPath $CasesFile | ConvertFrom-Json
  $fn = [string]$cases.fn

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
  $ws = $wb.Worksheets.Item(1)

  foreach ($c in $cases.cases) {
    $ws.Cells.Clear() | Out-Null
    if (Test-HasProp $c 'setup') {
      foreach ($p in $c.setup.PSObject.Properties) { $ws.Range($p.Name).Value = $p.Value }
    }

    # Build args. Do NOT wrap $c.args in @() -- that flattens a nested array argument.
    $callArgs = New-Object System.Collections.ArrayList
    [void]$callArgs.Add($fn)
    foreach ($a in $c.args) {
      if ($a -is [System.Array] -and $a.Count -gt 0 -and $a[0] -is [System.Array]) {
        # 2D jagged JSON array -> 2D Variant array (SAFEARRAY rank 2)
        $rows = $a.Count
        $cols = ($a[0]).Count
        $m = New-Object 'object[,]' $rows, $cols
        for ($ri = 0; $ri -lt $rows; $ri++) {
          for ($ci = 0; $ci -lt $cols; $ci++) { $m[$ri, $ci] = $a[$ri][$ci] }
        }
        [void]$callArgs.Add($m)
      } elseif ($a -is [System.Array]) {
        [void]$callArgs.Add([object[]]$a)             # 1D Variant array (SAFEARRAY rank 1)
      } elseif ((Test-HasProp $a 'range')) {
        [void]$callArgs.Add($ws.Range([string]$a.range))
      } else {
        [void]$callArgs.Add($a)
      }
    }

    $casePass = $true
    $actual = $null
    try {
      $actual = $excel.GetType().InvokeMember('Run', [System.Reflection.BindingFlags]::InvokeMethod, $null, $excel, $callArgs.ToArray())
    } catch {
      $casePass = $false
      Write-Output ("FAIL fn={0} run-error={1}" -f $fn, $_.Exception.Message)
    }

    if ($casePass -and (Test-HasProp $c 'expect')) {
      if ("$actual" -ne "$($c.expect)") {
        $casePass = $false
        Write-Output ("FAIL fn={0} expect={1} actual={2}" -f $fn, $c.expect, $actual)
      }
    }
    if ($casePass -and (Test-HasProp $c 'expectCells')) {
      foreach ($p in $c.expectCells.PSObject.Properties) {
        $cellVal = $ws.Range($p.Name).Value
        if ("$cellVal" -ne "$($p.Value)") {
          $casePass = $false
          Write-Output ("FAIL fn={0} cell={1} expect={2} actual={3}" -f $fn, $p.Name, $p.Value, $cellVal)
        }
      }
    }
    if ($casePass -and (Test-HasProp $c 'expectArray')) {
      $actualJoined = ((@($actual) | ForEach-Object { "$_" }) -join '|')
      $expJoined = ((@($c.expectArray) | ForEach-Object { "$_" }) -join '|')
      if ($actualJoined -ne $expJoined) {
        $casePass = $false
        Write-Output ("FAIL fn={0} expectArray=[{1}] actual=[{2}]" -f $fn, $expJoined, $actualJoined)
      }
    }

    if (-not $casePass) { $allPass = $false }
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
  if ($excelPid) {
    $p = Get-Process -Id $excelPid -ErrorAction SilentlyContinue
    if ($null -ne $p -and $p.ProcessName -eq 'EXCEL') { Stop-Process -Id $excelPid -Force -ErrorAction SilentlyContinue }
  }
}
if ($allPass) { exit 0 } else { exit 1 }
