@echo off
title Easy Padhai - Audio Lecture Compressor
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0compress-lectures.ps1" %*
