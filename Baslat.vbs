Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "C:\Projects\AICodeReview\scripts\run_backend.bat" & Chr(34), 0
Set WshShell = Nothing
