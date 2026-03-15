@echo off
setlocal
cd /d "%~dp0"
echo Starting backend on http://localhost:3000 ...
node --watch server.js

