if {%Rcarry%}=={1} ( goto :start )
if '%PROCESSOR_ARCHITECTURE%' EQU 'amd64' (
   >nul 2>&1 "%SYSTEMROOT%\SysWOW64\icacls.exe" "%SYSTEMROOT%\SysWOW64\config"
 ) else (
   >nul 2>&1 "%SYSTEMROOT%\system32\icacls.exe" "%SYSTEMROOT%\system32\config"
)
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
echo.
title Installing package manager...
setlocal EnableDelayedExpansion EnableExtentions
cls
:start
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

title Building temporary scripts...


echo title Installing node.js...>build2.bat
echo setlocal EnableDelayedExpansion EnableExtentions>>build2.bat
echo choco install nodejs -y>>build2.bat
echo start build3.bat>>build2.bat
echo del /q build2.bat ^& exit>>build2.bat

echo title Installing dependencies...>build3.bat
echo setlocal enabledelayedexpansion>>build3.bat
echo if 1==1 (>>build3.bat
echo 	npm install>>build3.bat
echo 	title Compiling...>>build3.bat
echo 	@echo off>>build3.bat
echo 	cls>>build3.bat
echo 	node -v>>build3.bat
echo 	echo This should have an output like v#.#.#>>build3.bat
echo 	choice /c yn /m "---- Do you wish to compile a 32 bit app? (Y/N)" /n>>build3.bat
echo 	if errorlevel 2 npm run package-win >>build3.bat
echo 	if errorlevel 1 npm run package-win32>>build3.bat
echo 	echo.>>build3.bat
echo 	echo  Done. Visit release-builds for your app>>build3.bat
echo 	echo.>>build3.bat
echo 	start build4.bat>>build3.bat
echo 	del /q build3.bat ^& exit>>build3.bat
echo )>>build3.bat

echo @echo off>build4.bat
echo cls>>build4.bat
echo choice /c yn /m "---- Would you like to place a shortcut on your desktop? (Y/N)" /n>>build4.bat
echo if errorlevel 1 ( goto :run )>>build4.bat
echo del /q build4.bat ^& exit>>build4.bat
echo :run>>build4.bat
echo title Forming link script...>>build4.bat
echo @echo on>>build4.bat
echo setlocal>>build4.bat
echo dir /b hashes.exe /s 2^> nul ^| find ^"^" /v /c ^> %%temp%%\count>>build4.bat
echo set /p _count=^<%%temp%%\count>>build4.bat
echo del /q %%temp%%\count>>build4.bat
echo echo.>>build4.bat
echo echo  Apps found : %%_count%%>>build4.bat
echo echo Paths :>>build4.bat
echo for /F "tokens=*" %%%%A in ('dir /b hashes.exe /s') do ( >>build4.bat
echo 	set "build=%%%%A">>build4.bat
echo 	echo    - %%%%A>>build4.bat
echo )>>build4.bat
echo echo  Using last option found...>>build4.bat
echo set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%.vbs">>build4.bat
echo echo Set oWS = WScript.CreateObject("WScript.Shell")^>%%SCRIPT%%>>build4.bat
echo echo sLinkFile = "%USERPROFILE%\Desktop\Hashes.lnk"^>^>%%SCRIPT%%>>build4.bat
echo echo Set oLink = oWS.CreateShortcut(sLinkFile)^>^>%%SCRIPT%%>>build4.bat
echo echo oLink.TargetPath = "%%build%%"^>^>%%SCRIPT%%>>build4.bat
echo echo oLink.Save^>^>%%SCRIPT%%>>build4.bat
echo title Running link script...>>build4.bat
echo cscript /nologo %%SCRIPT%%>>build4.bat
echo del /q %%SCRIPT%% ^& del /q build4.bat ^& exit>>build4.bat
pause
start build2.bat