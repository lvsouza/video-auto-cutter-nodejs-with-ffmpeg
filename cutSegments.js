import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";


/**
 * @typedef {Object} SegmentResult
 * @property {string} path - Caminho do arquivo gerado do segmento.
 * @property {number} start - Tempo inicial do segmento.
 * @property {number} end - Tempo final do segmento.
 * @property {number} duration - Duração total do segmento.
 */

/**
 * Corta segmentos de um vídeo com base nos tempos fornecidos e salva em arquivos separados.
 * 
 * @param {string} videoPath - Caminho do vídeo original.
 * @param {string} outputDir - Caminho da pasta onde salvar os segmentos.
 * @param {import('./getSegments').Segment[]} segments - Lista de segmentos com tempo inicial e final.
 * @returns {Promise<SegmentResult[]>}
 */
export async function cutSegments(videoPath, outputDir, segments) {
  const fileType = videoPath.split('.').at(-1)

  await fs.mkdir(outputDir, { recursive: true });

  const results = await Promise.all(
    segments.map((segment, index) => {
      const outputFile = join(outputDir, `segment_${index + 1}.${fileType}`);
      const duration = segment.end - segment.start;

      return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-y",
          "-ss", segment.start.toString(),
          "-i", videoPath,
          "-t", duration.toString(),
          "-c:v", "libx264",
          "-c:a", "aac",
          outputFile,
        ]);

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve({ path: outputFile, start: segment.start, end: segment.end, duration: segment.end - segment.start });
          } else {
            reject(new Error(`Erro ao cortar segmento ${index + 1}`));
          }
        });
      });
    })
  );

  return results;
}
