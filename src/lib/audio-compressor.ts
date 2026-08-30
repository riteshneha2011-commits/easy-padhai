/**
 * Voice-Optimized In-Browser Audio Compressor for Easy Padhai.
 * Compresses 40-50MB raw/stereo audio files down to crisp voice audio
 * by downmixing to speech-focused mono and 16-bit PCM/WAV at 32kHz/44.1kHz.
 * Runs 100% locally in the browser in ~1-2 seconds.
 */

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, "WAVE");
  // format chunk identifier
  writeString(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono for speech clarity)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, "data");
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export type CompressionResult = {
  file: File;
  originalSizeMb: number;
  compressedSizeMb: number;
  savedPercent: number;
};

export async function compressAudioForSpeech(
  file: File,
  onStatus?: (status: string) => void
): Promise<CompressionResult> {
  const origMb = Number((file.size / (1024 * 1024)).toFixed(1));

  // If file is already under 5MB, keep as-is
  if (file.size < 5 * 1024 * 1024) {
    return {
      file,
      originalSizeMb: origMb,
      compressedSizeMb: origMb,
      savedPercent: 0,
    };
  }

  onStatus?.(`Optimizing lecture voice quality (${origMb} MB)...`);

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    return { file, originalSizeMb: origMb, compressedSizeMb: origMb, savedPercent: 0 };
  }

  const audioContext = new AudioCtx();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Target sample rate: 32000Hz (perfect for speech/lectures, captures all vocal frequencies up to 16kHz)
    const targetSampleRate = 32000;
    const offlineCtx = new OfflineAudioContext(
      1, // Mono channel (clean speech, cuts 50% size immediately)
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();
    const channelData = rendered.getChannelData(0);

    const wavBlob = encodeWAV(channelData, targetSampleRate);
    const newName = file.name.replace(/\.[^/.]+$/, "") + "-optimized.wav";
    const compressedFile = new File([wavBlob], newName, { type: "audio/wav" });

    const compMb = Number((compressedFile.size / (1024 * 1024)).toFixed(1));
    const saved = Math.round(((file.size - compressedFile.size) / file.size) * 100);

    if (compressedFile.size < file.size) {
      return {
        file: compressedFile,
        originalSizeMb: origMb,
        compressedSizeMb: compMb,
        savedPercent: saved,
      };
    }

    return { file, originalSizeMb: origMb, compressedSizeMb: origMb, savedPercent: 0 };
  } catch (err) {
    console.warn("Audio compression fallback to original:", err);
    return { file, originalSizeMb: origMb, compressedSizeMb: origMb, savedPercent: 0 };
  } finally {
    await audioContext.close().catch(() => {});
  }
}
