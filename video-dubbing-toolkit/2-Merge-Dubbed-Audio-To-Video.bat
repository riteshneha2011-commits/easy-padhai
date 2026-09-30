@echo off
title Easy Padhai - Merge Dubbed Audio with Video
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp02-Merge-Dubbed-Audio-To-Video.ps1" %*
