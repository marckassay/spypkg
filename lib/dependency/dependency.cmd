:: SPYPKG HAS GENERATED THIS FILE!
:: If the above comment is modified or removed, 'spypkg' will not delete this file.
@ECHO OFF
@SETLOCAL
SETLOCAL enableDelayedExpansion

@SET PATHEXT=%PATHEXT:;.JS;=;%

SET $CurrentDir=%cd%
SET $Args=%~n0 %*
SET $JsonConfig=%$CurrentDir%\package.json

IF NOT EXIST %$JsonConfig% (
  ECHO 'spypkg' was unable to load 'package.json' in the current directory for '%~n0' command.
  ECHO Remove the following file if not needed: %0

  ENDLOCAL
  @ECHO ON

  EXIT 1
)

:: returns absolute path to projectOutPath directory
FOR /F "USEBACKQ tokens=2 delims=:," %%G IN (`findstr /r /c:".*projectOutPath.*:.*" %$JsonConfig%`) DO (
  SET $Outpath=%%G
  SET $Outpath=!$Outpath:"=!
  SET $Outpath=!$Outpath:.\\=!
  SET $Outpath=!$Outpath:\\=\!
  SET $Outpath=!$Outpath:/=\!
  SET $Outpath=!$Outpath: =!
)

:: if the optional property is not available, then set it to spypkg's dist folder
IF "%$Outpath%" == "" (
  SET $Outpath=node_modules\spypkg\dist\lib\adaptor
)

IF NOT EXIST %$CurrentDir%\%$Outpath% (
  ECHO 'spypkg' was unable to find '%$Outpath%' directory.
  ECHO Remove the following file if not needed: %0

  ENDLOCAL
  @ECHO ON

  EXIT 1
)

:: set AdaptorFullPath to custom name adaptor ([name]-adaptor.js)
SET $AdaptorFullPath=%$CurrentDir%\%$Outpath%\%~n0-adaptor.js
SET $AdaptorFullPath=!$AdaptorFullPath:\\=\!

:: ...if custom name adaptor doesn't exist, then set it to 'adaptor.js'
IF NOT EXIST %$AdaptorFullPath% (
  SET $AdaptorFullPath=%$CurrentDir%\%$Outpath%\adaptor.js
)
:: TODO adds this echo back when silent switch is implemented.
:: ECHO [spypkg] Executing: node %$AdaptorFullPath% %$Args%
node %$AdaptorFullPath% %$Args%

ENDLOCAL
@ECHO ON
