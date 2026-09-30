# ==============================================================================
# Easy Padhai - Merge Dubbed Audio with Original Video
# Replaces original Hindi audio with new English/Hinglish dubbed audio from ElevenLabs.
# Runs in 3 seconds using stream copy (Zero video quality loss, no re-encoding!)
# ==============================================================================

param (
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InputPaths = @()
)

try {
    $Host.UI.RawUI.WindowTitle = "Easy Padhai - Merge Dubbed Audio with Video"
} catch {}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   EASY PADHAI - 1-CLICK DUBBED AUDIO TO VIDEO MERGER             " -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Attaches new dubbed audio into your original MP4 video in 3 seconds." -ForegroundColor Gray
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir = Join-Path $ScriptDir "bin"
$FfmpegExe = Join-Path $BinDir "ffmpeg.exe"
$VideosDir = Join-Path $ScriptDir "1_input_videos"
$DubbedAudioDir = Join-Path $ScriptDir "3_dubbed_audio_from_elevenlabs"
$OutputDir = Join-Path $ScriptDir "4_final_dubbed_videos"

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
if (!(Test-Path $VideosDir)) {
    New-Item -ItemType Directory -Path $VideosDir -Force | Out-Null
}
if (!(Test-Path $DubbedAudioDir)) {
    New-Item -ItemType Directory -Path $DubbedAudioDir -Force | Out-Null
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
$AudioRegex = '\.(mp3|wav|m4a|aac|ogg|flac|opus)$'

$PairsToProcess = @()

# Case 1: Dragged & dropped paths (e.g. user dragged both video and audio together)
if ($InputPaths -and $InputPaths.Count -gt 0) {
    $DroppedVideos = @()
    $DroppedAudios = @()
    foreach ($RawPath in $InputPaths) {
        $CleanPath = $RawPath.Trim('"').Trim()
        if (Test-Path $CleanPath) {
            $Item = Get-Item $CleanPath
            if ($Item -is [System.IO.FileInfo]) {
                if ($Item.Extension -match $VideoRegex) { $DroppedVideos += $Item }
                elseif ($Item.Extension -match $AudioRegex) { $DroppedAudios += $Item }
            }
        }
    }

    if ($DroppedVideos.Count -eq 1 -and $DroppedAudios.Count -eq 1) {
        $PairsToProcess += [PSCustomObject]@{
            Video = $DroppedVideos[0]
            Audio = $DroppedAudios[0]
            OutputName = "$([System.IO.Path]::GetFileNameWithoutExtension($DroppedVideos[0].Name))_English_Dubbed.mp4"
        }
    }
}

# Case 2: Auto-match files from 3_dubbed_audio_from_elevenlabs and 1_input_videos
if ($PairsToProcess.Count -eq 0) {
    $AvailableAudios = Get-ChildItem -Path $DubbedAudioDir -File | Where-Object { $_.Extension -match $AudioRegex }
    $AvailableVideos = (Get-ChildItem -Path $VideosDir -File | Where-Object { $_.Extension -match $VideoRegex }) +
                       (Get-ChildItem -Path $ScriptDir -File | Where-Object { $_.Extension -match $VideoRegex })

    foreach ($Audio in $AvailableAudios) {
        # Normalize audio name to match video (strips _english, _dubbed, etc.)
        $CleanAudioBase = [System.IO.Path]::GetFileNameWithoutExtension($Audio.Name)
        $NormalizedBase = $CleanAudioBase -replace '(?i)(_dubbed|_english|_hindi|_hinglish|_audio|_for_dubbing)$', ''

        $MatchedVideo = $AvailableVideos | Where-Object {
            $VideoBase = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
            ($VideoBase -eq $CleanAudioBase) -or ($VideoBase -eq $NormalizedBase) -or ($CleanAudioBase.StartsWith($VideoBase))
        } | Select-Object -First 1

        if ($MatchedVideo) {
            $PairsToProcess += [PSCustomObject]@{
                Video = $MatchedVideo
                Audio = $Audio
                OutputName = "$([System.IO.Path]::GetFileNameWithoutExtension($MatchedVideo.Name))_English_Dubbed.mp4"
            }
        }
    }
}

if ($PairsToProcess.Count -eq 0) {
    Write-Host "No matching video & dubbed audio pairs found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "How to use:" -ForegroundColor Cyan
    Write-Host "  Step 1: Put your original video in '1_input_videos'." -ForegroundColor White
    Write-Host "  Step 2: Put your dubbed ElevenLabs audio in '3_dubbed_audio_from_elevenlabs'." -ForegroundColor White
    Write-Host "          (Make sure the audio has a similar name as the video!)" -ForegroundColor Gray
    Write-Host "  Step 3: Run this script again, and it will pair and merge them in 3 seconds!" -ForegroundColor White
    Write-Host ""
    Write-Host "OR: You can select both the video and audio file together in Windows and drag them onto this .bat file!" -ForegroundColor Green
    Write-Host ""
    Read-Host "Press Enter to open folders and exit..."
    Start-Process explorer.exe $DubbedAudioDir
    exit 0
}

Write-Host "Found $($PairsToProcess.Count) video/audio pair(s) ready to merge!" -ForegroundColor Green
Write-Host ""

$Index = 0
$SuccessCount = 0

foreach ($Pair in $PairsToProcess) {
    $Index++
    $TargetVideoPath = Join-Path $OutputDir $Pair.OutputName

    Write-Host "[$Index/$($PairsToProcess.Count)] Merging:" -ForegroundColor White
    Write-Host "   Video: $($Pair.Video.Name)" -ForegroundColor Gray
    Write-Host "   Audio: $($Pair.Audio.Name)" -ForegroundColor Gray

    $Sw = [System.Diagnostics.Stopwatch]::StartNew()

    # Stream copy video (instant, no re-encode) + high quality AAC audio
    $FfmpegArgs = @(
        "-y",
        "-i", $Pair.Video.FullName,
        "-i", $Pair.Audio.FullName,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        $TargetVideoPath
    )

    $Process = Start-Process -FilePath $FfmpegExe -ArgumentList $FfmpegArgs -NoNewWindow -PassThru -Wait -RedirectStandardError ([System.IO.Path]::GetTempFileName())

    $Sw.Stop()

    if ($Process.ExitCode -eq 0 -and (Test-Path $TargetVideoPath)) {
        $FinalSizeMb = [math]::Round((Get-Item $TargetVideoPath).Length / 1MB, 2)
        $Seconds = [math]::Round($Sw.Elapsed.TotalSeconds, 1)

        Write-Host "  -> Done in ${Seconds}s: $($Pair.OutputName) ($FinalSizeMb MB)!" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "  -> Merge failed for $($Pair.Video.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  MERGED $SuccessCount DUBBED VIDEOS SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Final English Dubbed Videos are saved in: $OutputDir" -ForegroundColor Yellow
Write-Host ""

Start-Process explorer.exe $OutputDir

Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
