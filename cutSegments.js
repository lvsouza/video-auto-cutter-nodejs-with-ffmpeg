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
 * @param {number} batchSize - Controla a quantidade de segmentos que será criados em paralelo. Evita estouro de memória.
 * @returns {Promise<[SegmentResult[], (() => Promise<void>)]>}
 */
export async function cutSegments(videoPath, outputDir, segments, batchSize = 2, segmentStatus = { message: '0/0' }) {
  const fileType = videoPath.split('.').at(-1)

  await fs.mkdir(outputDir, { recursive: true });

  const allResults = [];
  for (let i = 0; i < segments.length; i += batchSize) {
    segmentStatus.message = `${i + 1}/${segments.length}`;

    const batch = segments.slice(i, i + batchSize);

    const promises = batch.map((segment, index) => {
      const outputFile = join(outputDir, `segment_${index + i + 1}.${fileType}`);
      const duration = segment.end - segment.start;

      return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-y",
          "-ss", segment.start.toString(),
          "-i", videoPath,
          "-t", duration.toString(),
          "-c:v", "libx264",
          "-crf", "18",     // controle de qualidade (quanto menor, melhor; 18 é excelente)
          "-preset", "slow", // mais tempo, melhor compressão
          "-c:a", "aac",
          "-b:a", "192k",
          outputFile,
        ]);

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve({ path: outputFile, start: segment.start, end: segment.end, duration: segment.end - segment.start });
          } else {
            reject(new Error(`Erro ao cortar segmento ${index + i + 1}`));
          }
        });
      });
    })

    const results = await Promise.all(promises);

    allResults.push(...results);
  }

  const clearTemp = async () => {
    await fs.rm(outputDir, { recursive: true });
  }

  return [allResults, clearTemp];
}
