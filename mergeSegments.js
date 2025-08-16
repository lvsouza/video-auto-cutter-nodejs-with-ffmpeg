import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Concatena múltiplos segmentos de vídeo em um único arquivo usando ffmpeg.
 * 
 * @param {import('./cutSegments').SegmentResult[]} segments - Lista de segmentos com os caminhos dos arquivos.
 * @param {string} outputPath - Caminho do arquivo final de saída (ex: "final.mkv").
 * @param {string} listFilePath - Caminho do arquivo de merge para o ffmpeg
 */
export const mergeSegments = (segments, outputPath, listFilePath) => {
  const listContent = segments
    .map(seg => `file '${seg.path}'`)
    .join('\n');

  fs.writeFileSync(listFilePath, listContent);

  // Executa o ffmpeg para concatenar sem re-encodar
  execSync(
    `ffmpeg -y -f concat -safe 0 -i ${listFilePath} -c copy ${outputPath}`,
    { stdio: 'inherit' }
  );

  // Remove o arquivo de lista temporário
  fs.unlinkSync(listFilePath);
};
