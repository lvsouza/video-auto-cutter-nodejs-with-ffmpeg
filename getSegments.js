// getSegments.js
import { execSync } from "child_process";
import path from "path";


/**
 * @typedef {Object} Segment
 * @property {number} start - Tempo inicial do segmento em segundos.
 * @property {number} end - Tempo final do segmento em segundos.
 */

/**
 * Corta segmentos de um vídeo com base nos tempos fornecidos e salva em arquivos separados.
 * 
 * @param {string} videoPath - Caminho do vídeo original.
 * @returns {Segment[]}
 */
export function getSegments(videoPath) {
  const absPath = path.resolve(videoPath);

  // 1️⃣ Detecta silêncios no áudio
  const output = execSync(
    `ffmpeg -i "${absPath}" -af silencedetect=noise=-50dB:d=0.5 -f null - 2>&1`,
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
  const segments = [];
  let lastEnd = 0;

  for (const { start, end } of silences) {
    if (start > lastEnd) {
      segments.push({ start: lastEnd, end: start });
    }
    lastEnd = end;
  }

  if (lastEnd < duration) {
    segments.push({ start: lastEnd, end: duration });
  }

  return segments;
}

