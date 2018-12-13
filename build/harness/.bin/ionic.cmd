@ECHO OFF
@SETLOCAL

SET $CurrentDir=%cd%
SET $Args=%~n0 %*
SET $Expression=%$CurrentDir%\node_modules\.bin\%~n0.cmd

ECHO [spypkg] *Would be* executing: %$Expression% %*

ENDLOCAL
@ECHO ON
