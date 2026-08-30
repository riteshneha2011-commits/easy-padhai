import { Mp3Encoder } from "@breezystack/lamejs";

export type CompressionResult = {
  file: File;
  originalSizeMb: number;
  compressedSizeMb: number;
  savedPercent: number;
};

/**
 * Voice-Optimized In-Browser Audio Compressor for Easy Padhai.
 * Compresses 40-60MB raw/stereo audio files down to crystal-clear 48kbps MP3 (~4-7MB)
 * by downmixing to speech-focused mono and encoding via LAME MP3 in ~1-2 seconds.
 * Runs 100% locally in the browser with zero server payload overhead.
 */
export async function compressAudioForSpeech(
  file: File,
  onStatus?: (status: string) => void
): Promise<CompressionResult> {
  const origMb = Number((file.size / (1024 * 1024)).toFixed(1));

  // If already <= 4MB, no need to compress further
  if (file.size <= 4 * 1024 * 1024) {
    return { file, originalSizeMb: origMb, compressedSizeMb: origMb, savedPercent: 0 };
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
    onStatus?.("Reading audio channels...");
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Target sample rate for speech: 32000Hz (captures full human vocal range up to 16kHz)
    const targetSampleRate = 32000;
    const offlineCtx = new OfflineAudioContext(
      1, // Mono channel (clean speech, removes stereo bloat)
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    onStatus?.("Filtering vocal frequencies...");
    const renderedBuffer = await offlineCtx.startRendering();
    const floatSamples = renderedBuffer.getChannelData(0);

    onStatus?.("Encoding to ultra-compact speech MP3...");
    const sampleCount = floatSamples.length;
    const int16Samples = new Int16Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const s = Math.max(-1, Math.min(1, floatSamples[i]));
      int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // 48kbps mono MP3 at 32kHz (highest vocal clarity to file size ratio)
    const mp3encoder = new Mp3Encoder(1, targetSampleRate, 48);
    const mp3Data: Uint8Array[] = [];

    // Process in standard chunks of 1152 samples
    const blockSize = 1152;
    for (let i = 0; i < sampleCount; i += blockSize) {
      const chunk = int16Samples.subarray(i, i + blockSize);
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
    const endBuf = mp3encoder.flush();
    if (endBuf.length > 0) {
      mp3Data.push(new Uint8Array(endBuf));
    }

    const compressedBlob = new Blob(mp3Data as BlobPart[], { type: "audio/mp3" });
    const compressedFile = new File(
      [compressedBlob],
      file.name.replace(/\.[^/.]+$/, "") + ".mp3",
      { type: "audio/mp3" }
    );

    const newMb = Number((compressedFile.size / (1024 * 1024)).toFixed(1));
    const saved = Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100));

    return {
      file: compressedFile,
      originalSizeMb: origMb,
      compressedSizeMb: newMb,
      savedPercent: saved,
    };
  } catch (err) {
    console.warn("Audio compression failed, using original file:", err);
    return { file, originalSizeMb: origMb, compressedSizeMb: origMb, savedPercent: 0 };
  } finally {
    void audioContext.close().catch(() => {});
  }
}
