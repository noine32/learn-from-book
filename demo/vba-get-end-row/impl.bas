Attribute VB_Name = "TechniqueModule"
' 開始セルの列で、データが入っている最終行を返す（Ctrl+Up 相当・-4162 = xlUp）。
Function GetEndRow(ByVal StartCell As Range) As Long
    Dim ws As Worksheet
    Set ws = StartCell.Worksheet
    GetEndRow = ws.Cells(ws.Rows.Count, StartCell.Column).End(-4162).Row
End Function
