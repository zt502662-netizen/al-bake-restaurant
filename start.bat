@echo off
title Al Bake - QR Order System
color 0A
echo.
echo  ======================================
echo    AL BAKE - QR Order System
echo  ======================================
echo.
cd /d "%~dp0"
echo  [1/3] Detecting WiFi IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP: =%
echo        Your IP: %IP%
echo.
echo  [2/3] Generating QR codes for 10 tables...
node -e "const Q=require('qrcode'),f=require('fs'),ip='%IP%';for(let i=1;i<=10;i++)Q.toFile('qr-codes/table-'+i+'.png','http://'+ip+':3000/table/'+i,{width:400,margin:2},()=>console.log('  Table '+i+': http://'+ip+':3000/table/'+i))"
timeout /t 2 /nobreak >nul
echo.
echo  [3/3] Starting server...
echo.
echo  ========================================
echo   READY!
echo   Menu:  http://%IP%:3000/table/1
echo   Admin: http://%IP%:3000/admin
echo   DO NOT CLOSE THIS WINDOW!
echo  ========================================
echo.
start http://localhost:3000/admin
node server.js
