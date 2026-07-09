Attribute VB_Name = "TechniqueModule"
' 指定範囲の各セルの値を2倍にする（副作用・戻り値なしの Sub）。
Sub DoubleRange(ByVal Target As Range)
    Dim c As Range
    For Each c In Target
        c.Value = c.Value * 2
    Next c
End Sub
