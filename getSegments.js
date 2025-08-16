// getSegments.js
import { execSync } from "child_process";
import path from "path";

/**
 * @typedef {Object} Segment
 * @property {number} start - Tempo inicial do segmento em segundos.
 * @property {number} end - Tempo final do segmento em segundos.
 */

/**
 * Extrai segmentos com áudio de um vídeo usando FFmpeg, permitindo tolerância de silêncio.
 * 
 * @param {string} videoPath - Caminho do vídeo original.
 * @param {number} silenceAllowed - Silêncio permitido antes e depois do segmento (em milissegundos).
 * @param {number} silenceThreshold - Volume em dB abaixo do qual é considerado silêncio (ex: -50 para -50dB).
 * @returns {Segment[]}
 */
export function getSegments(videoPath, silenceAllowed = 0, silenceThreshold = -50) {
  const absPath = path.resolve(videoPath);
  const silenceSec = silenceAllowed / 1000; // converte para segundos

  // 1️⃣ Detecta silêncios no áudio
  const output = execSync(
    `ffmpeg -i "${absPath}" -af silencedetect=noise=${silenceThreshold}dB:d=0.5 -f null - 2>&1`,
    { encoding: "utf-8" }
  );

  // 2️⃣ Extrai tempos de início e fim dos silêncios
  const silenceRegex = /silence_(start|end): (\d+(\.\d+)?)/g;
  const silences = [];
  let lastStart = null;
  let match;
  while ((match = silenceRegex.exec(output)) !== null) {
    const type = match[1];
    const time = parseFloat(match[2]);

    if (type === "start") {
      lastStart = time;
    } else if (type === "end" && lastStart !== null) {
      silences.push({ start: lastStart, end: time });
      lastStart = null;
    }
  }

  // 3️⃣ Pega duração total do vídeo
  const duration = parseFloat(
    execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${absPath}"`,
      { encoding: "utf-8" }
    )
  );

  // 4️⃣ Constrói lista de segmentos com áudio
  let rawSegments = [];
  let lastEnd = 0;

  for (const { start, end } of silences) {
    if (start > lastEnd) {
      rawSegments.push({
        start: Math.max(0, lastEnd - silenceSec),
        end: Math.min(duration, start + silenceSec)
      });
    }
    lastEnd = end;
  }

  if (lastEnd < duration) {
    rawSegments.push({
      start: Math.max(0, lastEnd - silenceSec),
      end: duration
    });
  }

  // 5️⃣ Mescla segmentos muito próximos
  const mergedSegments = [];
  for (const seg of rawSegments) {
    if (
      mergedSegments.length > 0 &&
      seg.start - mergedSegments[mergedSegments.length - 1].end <= silenceSec
    ) {
      // Mescla com o último segmento
      mergedSegments[mergedSegments.length - 1].end = seg.end;
    } else {
      mergedSegments.push(seg);
    }
  }

  return mergedSegments.filter(segment => (segment.end - segment.start) > 1);
}
