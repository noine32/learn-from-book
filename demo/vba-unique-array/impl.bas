Attribute VB_Name = "TechniqueModule"
' 1次元配列の重複を除いた配列を返す（初出順を保つ）。
Function UniqueArray1D(ByVal Array1D As Variant) As Variant
    Dim d As Object
    Set d = CreateObject("Scripting.Dictionary")
    Dim i As Long
    For i = LBound(Array1D) To UBound(Array1D)
        If Not d.Exists(Array1D(i)) Then d.Add Array1D(i), True
    Next i
    UniqueArray1D = d.Keys
End Function
