import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

// Extensões de vídeo que queremos buscar
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];

/**
 * Função recursiva para encontrar arquivos de vídeo
 */
function findVideosInDirectory(dirPath, fileList = []) {
  let files;

  try {
    files = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Erro ao ler o diretório ${dirPath}:`, err.message);
    return fileList;
  }

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let stat;

    try {
      stat = fs.statSync(filePath);
    } catch (err) {
      return; // Pula se não conseguir ler detalhes do arquivo
    }

    if (stat.isDirectory()) {
      // Se for pasta, entra nela (recursividade)
      findVideosInDirectory(filePath, fileList);
    } else {
      // Se for arquivo, verifica as condições
      const ext = path.extname(file).toLowerCase();
      const fileNameUpper = file.toUpperCase();

      // 1. É uma extensão de vídeo válida?
      const isVideo = VIDEO_EXTENSIONS.includes(ext);

      // 2. Não deve conter .AUTOCUT. ou .READY.
      // Verifica no nome original, convertendo para upper para garantir
      const isAutoCut = fileNameUpper.includes('.AUTOCUT.');
      const isReady = fileNameUpper.includes('.READY.');

      if (isVideo && !isAutoCut && !isReady) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Função principal que gera a UI
 */
export async function selectVideos(targetPath) {
  console.log(`\n🔍 Analisando a pasta: ${targetPath} ...\n`);

  const allVideos = findVideosInDirectory(targetPath);

  if (allVideos.length === 0) {
    console.log("⚠️  Nenhum vídeo encontrado com os critérios especificados.");
    return;
  }

  // Cria o prompt de checkbox
  const response = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedFiles',
      message: 'Selecione os vídeos para processar (Espaço para marcar, Enter para confirmar):',
      choices: allVideos.map(videoPath => {
        return {
          name: path.relative(targetPath, videoPath), // Mostra o caminho relativo para ficar mais limpo
          value: videoPath,
          checked: false // Começa desmarcado (mude para true se quiser todos marcados)
        };
      }),
      pageSize: 15 // Quantos itens aparecem antes de precisar rolar
    }
  ]);

  return response.selectedFiles;
}
