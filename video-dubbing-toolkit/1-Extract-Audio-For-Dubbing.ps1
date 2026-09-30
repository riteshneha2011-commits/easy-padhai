# ==============================================================================
# Easy Padhai - Video Audio Extractor for AI Dubbing (ElevenLabs / Whisper)
# Extracts compressed, speech-optimized 64kbps Mono MP3 from MP4/MKV/MOV videos.
# 500 MB Video -> 5 MB Speech MP3 in 2 seconds!
# ==============================================================================

param (
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InputPaths = @()
)

try {
    $Host.UI.RawUI.WindowTitle = "Easy Padhai - Video Audio Extractor (for Dubbing)"
} catch {}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "    EASY PADHAI - 1-CLICK AUDIO EXTRACTOR (FOR AI DUBBING)        " -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Extracts ultra-lightweight speech MP3s from MP4 videos for ElevenLabs." -ForegroundColor Gray
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir = Join-Path $ScriptDir "bin"
$FfmpegExe = Join-Path $BinDir "ffmpeg.exe"
$InputDir = Join-Path $ScriptDir "1_input_videos"
$OutputDir = Join-Path $ScriptDir "2_audio_for_dubbing"

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
if (!(Test-Path $InputDir)) {
    New-Item -ItemType Directory -Path $InputDir -Force | Out-Null
}

if (!(Test-Path $FfmpegExe)) {
    $SysFfmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($SysFfmpeg) {
        $FfmpegExe = $SysFfmpeg.Source
    } else {
        Write-Host "Error: FFmpeg not found in $BinDir" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

$VideoRegex = '\.(mp4|mkv|mov|avi|webm|m4v|flv|ts|wmv)$'
$FilesToProcess = @()

# 1. Check drag & dropped paths
if ($InputPaths -and $InputPaths.Count -gt 0) {
    foreach ($RawPath in $InputPaths) {
        $CleanPath = $RawPath.Trim('"').Trim()
        if (Test-Path $CleanPath) {
            $Item = Get-Item $CleanPath
            if ($Item -is [System.IO.DirectoryInfo]) {
                $FilesToProcess += Get-ChildItem -Path $Item.FullName -File | Where-Object { $_.Extension -match $VideoRegex }
            } elseif ($Item -is [System.IO.FileInfo]) {
                if ($Item.Extension -match $VideoRegex) {
                    $FilesToProcess += $Item
                }
            }
        }
    }
}

# 2. Check 1_input_videos folder if nothing was dragged directly
if ($FilesToProcess.Count -eq 0) {
    $FilesToProcess += Get-ChildItem -Path $InputDir -File | Where-Object { $_.Extension -match $VideoRegex }
}

# 3. Check script directory root
if ($FilesToProcess.Count -eq 0) {
    $FilesToProcess += Get-ChildItem -Path $ScriptDir -File | Where-Object { $_.Extension -match $VideoRegex }
}

# Remove duplicates
$UniqueFiles = @()
$Seen = @{}
foreach ($F in $FilesToProcess) {
    if (!$Seen.ContainsKey($F.FullName)) {
        $Seen[$F.FullName] = $true
        $UniqueFiles += $F
    }
}

if ($UniqueFiles.Count -eq 0) {
    Write-Host "No video files found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "How to use:" -ForegroundColor Cyan
    Write-Host "  Option 1: Drag & drop your MP4 video files onto '1-Extract-Audio-For-Dubbing.bat'" -ForegroundColor White
    Write-Host "  Option 2: Place your MP4 videos inside the '1_input_videos' folder and run this script again." -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to open '1_input_videos' folder and exit..."
    Invoke-Item $InputDir
    exit 0
}

Write-Host "Found $($UniqueFiles.Count) video file(s) to extract audio from." -ForegroundColor Green
Write-Host ""

$Index = 0
$TotalSaved = 0
$SuccessCount = 0

foreach ($VideoFile in $UniqueFiles) {
    $Index++
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($VideoFile.Name)
    $TargetAudioName = "$BaseName.mp3"
    $TargetAudioPath = Join-Path $OutputDir $TargetAudioName

    $OrigSizeMb = [math]::Round($VideoFile.Length / 1MB, 2)
    Write-Host "[$Index/$($UniqueFiles.Count)] Extracting: $($VideoFile.Name) ($OrigSizeMb MB)..." -ForegroundColor White

    $Sw = [System.Diagnostics.Stopwatch]::StartNew()

    # High quality speech extraction: 64kbps, mono, 32kHz
    $FfmpegArgs = @(
        "-y",
        "-i", $VideoFile.FullName,
        "-vn",
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        "-ac", "1",
        "-ar", "32000",
        $TargetAudioPath
    )

    $Process = Start-Process -FilePath $FfmpegExe -ArgumentList $FfmpegArgs -NoNewWindow -PassThru -Wait -RedirectStandardError ([System.IO.Path]::GetTempFileName())

    $Sw.Stop()

    if ($Process.ExitCode -eq 0 -and (Test-Path $TargetAudioPath)) {
        $NewSize = (Get-Item $TargetAudioPath).Length
        $NewSizeMb = [math]::Round($NewSize / 1MB, 2)
        $Pct = [math]::Round((1 - ($NewSize / $VideoFile.Length)) * 100, 1)
        $Seconds = [math]::Round($Sw.Elapsed.TotalSeconds, 1)

        Write-Host "  -> Done in ${Seconds}s: $TargetAudioName ($NewSizeMb MB) [Size reduced by $Pct%!]" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "  -> Failed to extract audio for $($VideoFile.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  EXTRACTED $SuccessCount OF $($UniqueFiles.Count) VIDEOS SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Audio files are saved in: $OutputDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT STEP FOR DUBBING:" -ForegroundColor Cyan
Write-Host "  1. Upload these lightweight .mp3 files to ElevenLabs Dubbing (elevenlabs.io/dubbing)." -ForegroundColor White
Write-Host "  2. Choose Target Language (English, Hindi, or Hinglish) and click Dub." -ForegroundColor White
Write-Host "  3. Download the dubbed audio and place it in '3_dubbed_audio_from_elevenlabs'." -ForegroundColor White
Write-Host "  4. Run '2-Merge-Dubbed-Audio-To-Video.bat' to get your finished video in 3 seconds!" -ForegroundColor White
Write-Host ""

Start-Process explorer.exe $OutputDir

Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
