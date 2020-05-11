@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\classes\crownpeak\cmsify.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\classes\crownpeak\cmsify.js" %*
)