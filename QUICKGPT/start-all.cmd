@echo off
setlocal
cd /d "%~dp0"

start "QUICKGPT Backend" cmd /k node --watch server.js
start "QUICKGPT Frontend" cmd /k npm.cmd --prefix client run dev

