# ==============================================================================
# Easy Padhai - Ultra-Fast Desktop Audio Lecture Compressor
# Converts audio lectures (.wav, .m4a, .mp3, .aac, .ogg, .flac) to
# voice-optimized 48kbps, 32kHz, Mono MP3 in 2 seconds per file.
# Supports drag & drop of MULTIPLE files and folders at once!
# ==============================================================================

param (
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InputPaths = @()
)

try {
    $Host.UI.RawUI.WindowTitle = "Easy Padhai - Audio Compressor"
} catch {}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "       EASY PADHAI - 1-CLICK DESKTOP AUDIO COMPRESSOR            " -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Optimizes lecture audio to 48kbps Mono MP3 for instant web upload." -ForegroundColor Gray
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir = Join-Path $ScriptDir "bin"
$OutputDir = Join-Path $ScriptDir "optimized_output"

if (!(Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$FfmpegExe = Join-Path $BinDir "ffmpeg.exe"

# 1. Locate or install portable FFmpeg
if (!(Test-Path $FfmpegExe)) {
    $SysFfmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($SysFfmpeg) {
        $FfmpegExe = $SysFfmpeg.Source
        Write-Host "Using system FFmpeg: $FfmpegExe" -ForegroundColor Green
    } else {
        Write-Host "One-time setup: Downloading lightweight portable FFmpeg..." -ForegroundColor Yellow
        $ZipPath = Join-Path $BinDir "ffmpeg.zip"
        $DownloadUrl = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-win-64.zip"
        
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $WebClient = New-Object System.Net.WebClient
            $WebClient.Headers.Add("User-Agent", "EasyPadhai-Compressor")
            $WebClient.DownloadFile($DownloadUrl, $ZipPath)
            
            Write-Host "Extracting portable FFmpeg..." -ForegroundColor Green
            Expand-Archive -Path $ZipPath -DestinationPath $BinDir -Force
            Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
            Write-Host "Ready! Portable FFmpeg installed in $BinDir" -ForegroundColor Green
            Write-Host ""
        } catch {
            Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please download ffmpeg.exe manually and put it into: $BinDir" -ForegroundColor Yellow
            if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
                Write-Host "Press Enter to exit..." -ForegroundColor Gray
                Read-Host
            }
            exit 1
        }
    }
}

# 2. Determine files to process (handles multiple files & folders dropped)
$AudioRegex = '\.(wav|m4a|mp3|aac|ogg|flac|wma|opus|webm)$'
$FilesToProcess = @()

if ($InputPaths -and $InputPaths.Count -gt 0) {
    foreach ($RawPath in $InputPaths) {
        $CleanPath = $RawPath.Trim('"').Trim()
        if (Test-Path $CleanPath) {
            $Item = Get-Item $CleanPath
            if ($Item -is [System.IO.DirectoryInfo]) {
                $FilesToProcess += Get-ChildItem -Path $Item.FullName -File | Where-Object { $_.Extension -match $AudioRegex }
            } elseif ($Item -is [System.IO.FileInfo]) {
                if ($Item.Extension -match $AudioRegex) {
                    $FilesToProcess += $Item
                }
            }
        }
    }
}

# If no files were dropped directly, check script directory and input/ folder
if ($FilesToProcess.Count -eq 0) {
    $FilesToProcess += Get-ChildItem -Path $ScriptDir -File | Where-Object { $_.Extension -match $AudioRegex }
    
    $InputDir = Join-Path $ScriptDir "input"
    if (Test-Path $InputDir) {
        $FilesToProcess += Get-ChildItem -Path $InputDir -File | Where-Object { $_.Extension -match $AudioRegex }
    }
}

# De-duplicate files by full path
if ($FilesToProcess.Count -gt 0) {
    $UniqueMap = @{}
    $Deduped = @()
    foreach ($F in $FilesToProcess) {
        if (-not $UniqueMap.ContainsKey($F.FullName.ToLowerInvariant())) {
            $UniqueMap[$F.FullName.ToLowerInvariant()] = $true
            $Deduped += $F
        }
    }
    $FilesToProcess = $Deduped
}

if ($FilesToProcess.Count -eq 0) {
    Write-Host "No audio files found to compress!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "How to use:" -ForegroundColor Cyan
    Write-Host "1. Select MULTIPLE audio files (.wav, .m4a, .mp3, etc.) with mouse/keyboard" -ForegroundColor White
    Write-Host "2. Drag and drop all selected files together onto 'compress-lectures.bat'" -ForegroundColor White
    Write-Host "   OR put your audio files into this folder: $ScriptDir" -ForegroundColor Gray
    Write-Host "3. Double-click compress-lectures.bat" -ForegroundColor White
    Write-Host "4. Done! All optimized files will appear in 'optimized_output'" -ForegroundColor White
    Write-Host ""
    
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        Write-Host "Press Enter to exit..." -ForegroundColor DarkGray
        Read-Host
    }
    exit 0
}

Write-Host "Found $($FilesToProcess.Count) audio lecture(s) to optimize in batch:" -ForegroundColor Cyan
Write-Host ""

$Index = 1
$SuccessCount = 0

foreach ($File in $FilesToProcess) {
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($File.Name)
    $TargetFile = Join-Path $OutputDir "$BaseName.mp3"
    $OriginalSizeMb = [math]::Round($File.Length / 1MB, 2)

    Write-Host "[$Index/$($FilesToProcess.Count)] Converting: $($File.Name) ($($OriginalSizeMb) MB)... " -ForegroundColor Yellow -NoNewline

    $Args = @(
        "-i", "`"$($File.FullName)`"",
        "-vn",
        "-ar", "32000",
        "-ac", "1",
        "-b:a", "48k",
        "-f", "mp3",
        "`"$TargetFile`"",
        "-y",
        "-loglevel", "error"
    )

    $Process = Start-Process -FilePath $FfmpegExe -ArgumentList ($Args -join " ") -Wait -PassThru -NoNewWindow

    if ($Process.ExitCode -eq 0 -and (Test-Path $TargetFile)) {
        $NewSizeMb = [math]::Round((Get-Item $TargetFile).Length / 1MB, 2)
        $SavedPercent = [math]::Round((($OriginalSizeMb - $NewSizeMb) / $OriginalSizeMb) * 100)
        Write-Host "Done! -> $($NewSizeMb) MB (saved $($SavedPercent)%)" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "Failed!" -ForegroundColor Red
    }
    $Index++
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Successfully converted $SuccessCount of $($FilesToProcess.Count) lecture(s)!" -ForegroundColor Green
Write-Host "Output Folder: $OutputDir" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "These files are now 100% pre-optimized for instant 1-second upload" -ForegroundColor White
Write-Host "to Easy Padhai without any in-browser waiting!" -ForegroundColor White
Write-Host ""

if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    try {
        Start-Process explorer.exe -ArgumentList "`"$OutputDir`""
    } catch {}
    Write-Host "Press Enter to exit..." -ForegroundColor DarkGray
    Read-Host
}
