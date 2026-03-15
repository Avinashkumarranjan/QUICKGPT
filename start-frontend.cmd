@echo off
setlocal
cd /d "%~dp0client"
echo Starting frontend on http://localhost:5173 ...
npm.cmd run dev

