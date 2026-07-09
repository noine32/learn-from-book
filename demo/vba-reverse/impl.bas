Attribute VB_Name = "TechniqueModule"
Function ReverseString(ByVal s As String) As String
    Dim i As Long, r As String
    r = ""
    For i = Len(s) To 1 Step -1
        r = r & Mid(s, i, 1)
    Next i
    ReverseString = r
End Function
