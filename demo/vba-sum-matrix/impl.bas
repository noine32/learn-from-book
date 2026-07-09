Attribute VB_Name = "TechniqueModule"
' 2次元配列の全要素の合計を返す。
Function SumMatrix(ByVal Array2D As Variant) As Long
    Dim total As Long, r As Long, c As Long
    total = 0
    For r = LBound(Array2D, 1) To UBound(Array2D, 1)
        For c = LBound(Array2D, 2) To UBound(Array2D, 2)
            total = total + Array2D(r, c)
        Next c
    Next r
    SumMatrix = total
End Function
