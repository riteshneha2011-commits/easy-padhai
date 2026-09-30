@echo off
title Easy Padhai - AI Video Dubbing Toolkit
setlocal EnableDelayedExpansion

:MENU
cls
echo ==================================================================
echo         EASY PADHAI - VIDEO DUBBING ^& TRANSLATION TOOLKIT
echo ==================================================================
echo   100%% Local, Zero-Token Audio Extraction ^& Instant Video Remuxing
echo ==================================================================
echo.
echo   [1] Extract Compressed Speech MP3 from Videos (for ElevenLabs)
echo   [2] Merge Dubbed Audio into Original Video (Instant 3-sec merge)
echo.
echo   [3] Open Input Videos Folder        (1_input_videos)
echo   [4] Open Extracted Audio Folder     (2_audio_for_dubbing)
echo   [5] Open ElevenLabs Audio Folder    (3_dubbed_audio_from_elevenlabs)
echo   [6] Open Final Dubbed Videos Folder (4_final_dubbed_videos)
echo.
echo   [7] View Step-by-Step ElevenLabs Dubbing Guide
echo   [8] Open ElevenLabs Dubbing in Web Browser (elevenlabs.io/dubbing)
echo.
echo   [0] Exit
echo.
echo ==================================================================
set /p choice="Enter your choice [0-8]: "

if "%choice%"=="1" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp01-Extract-Audio-For-Dubbing.ps1"
    goto MENU
)
if "%choice%"=="2" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp02-Merge-Dubbed-Audio-To-Video.ps1"
    goto MENU
)
if "%choice%"=="3" (
    start "" "%~dp01_input_videos"
    goto MENU
)
if "%choice%"=="4" (
    start "" "%~dp02_audio_for_dubbing"
    goto MENU
)
if "%choice%"=="5" (
    start "" "%~dp03_dubbed_audio_from_elevenlabs"
    goto MENU
)
if "%choice%"=="6" (
    start "" "%~dp04_final_dubbed_videos"
    goto MENU
)
if "%choice%"=="7" (
    start notepad "%~dp0HOW-TO-USE-GUIDE.txt"
    goto MENU
)
if "%choice%"=="8" (
    start https://elevenlabs.io/dubbing
    goto MENU
)
if "%choice%"=="0" (
    exit /b
)

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto MENU
