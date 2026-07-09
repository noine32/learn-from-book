Attribute VB_Name = "TechniqueModule"
' 1次元配列を昇順ソートして返す（渡された配列の LBound/UBound を尊重）。
Function SortArray1D(ByVal Array1D As Variant) As Variant
    Dim a() As Variant
    Dim lo As Long, hi As Long, i As Long, j As Long, tmp As Variant
    lo = LBound(Array1D)
    hi = UBound(Array1D)
    ReDim a(lo To hi)
    For i = lo To hi
        a(i) = Array1D(i)
    Next i
    For i = lo To hi - 1
        For j = i + 1 To hi
            If a(j) < a(i) Then
                tmp = a(i)
                a(i) = a(j)
                a(j) = tmp
            End If
        Next j
    Next i
    SortArray1D = a
End Function
