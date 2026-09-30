@echo off
title Easy Padhai - Extract Audio for Dubbing
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp01-Extract-Audio-For-Dubbing.ps1" %*
