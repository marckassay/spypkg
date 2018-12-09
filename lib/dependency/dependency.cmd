:: altpackage has generated this file
@ECHO OFF
@SETLOCAL
SETLOCAL enableDelayedExpansion

@SET PATHEXT=%PATHEXT:;.JS;=;%

SET $CurrentDir=%cd%
SET $Args=%~n0 %*
SET $JsonConfig=%$CurrentDir%\package.json

:: returns absolute path to projectOutPath directory
FOR /F "USEBACKQ tokens=2 delims=:," %%G IN (`findstr /r /c:".*projectOutPath.*:.*" %$JsonConfig%`) DO (
  SET $Outpath=%%G
  SET $Outpath=!$Outpath:"=!
  SET $Outpath=!$Outpath:.\\=!
  SET $Outpath=!$Outpath:\\=\!
  SET $Outpath=!$Outpath:/=\!
  SET $Outpath=!$Outpath: =!
)

SET $AdaptorFullPath=%$CurrentDir%\%$Outpath%\%~n0-adaptor.js
SET $AdaptorFullPath=!$AdaptorFullPath:\\=\!

IF NOT EXIST %$AdaptorFullPath% (
  SET $AdaptorFullPath=%$CurrentDir%\%$Outpath%\adaptor.js
)

ECHO [altpackage] Executing: node %$AdaptorFullPath% %$Args%
node %$AdaptorFullPath% %$Args%

ENDLOCAL
@ECHO ON
