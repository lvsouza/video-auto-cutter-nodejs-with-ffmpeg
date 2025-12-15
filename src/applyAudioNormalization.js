import { spawn } from 'node:child_process';
import path from 'node:path';

/**
 * Aplica normalização de áudio (Loudness) mantendo o vídeo intacto.
 * * @param {string} videoPath - Caminho do arquivo de vídeo original.
 * @param {object} options - Opções de configuração (ex: outputPath).
 * @returns {Promise<string>} - Caminho do arquivo gerado.
 */
export function applyAudioNormalization(videoPath, options = {}) {
  return new Promise((resolve, reject) => {
    const { outputPath } = options;
    const parsed = path.parse(videoPath);

    // Define o caminho de saída padrão se não for fornecido
    const normalizedPath =
      outputPath ??
      path.join(parsed.dir, `AUTOAUDIO.${parsed.name}${parsed.ext}`);


    // AUDIO: de-esser + loudnorm
    const audioFilter =
      // --- AUDIO PROCESSING ---
      // loudnorm: Normalização EBU R128 (Single pass)
      // I=-16: Target Integrated Loudness (Volume alvo)
      // TP=-1.5: True Peak (Limite máximo para evitar clipagem/distorção)
      // LRA=11: Loudness Range (Faixa dinâmica, mantém a naturalidade)
      'equalizer=f=7500:t=q:w=3000:g=-6,' +
      'loudnorm=I=-16:TP=-1.5:LRA=11';

    const args = [
      '-y', // Sobrescrever arquivo de saída se existir
      '-hide_banner', // Esconde informações de build do ffmpeg (limpeza)

      // --- INPUT OPTIONS ---
      // Ajudam a corrigir timestamps quebrados antes de processar
      '-fflags', '+genpts',
      '-avoid_negative_ts', 'make_zero',

      '-i', videoPath,

      '-filter:a', audioFilter,

      // --- VIDEO PROCESSING ---
      // 'copy': Copia o stream de vídeo exatamente como está.
      // NÃO altera qualidade, NÃO altera cores, processamento ultra-rápido.
      '-c:v', 'copy',

      // --- AUDIO ENCODING ---
      // Como alteramos o áudio (filtro), precisamos recodificar o áudio.
      '-c:a', 'aac',
      '-b:a', '192k', // 192kbps é excelente para AAC estéreo
      '-ar', '48000', // Garante taxa de amostragem padrão (48kHz)

      // --- OUTPUT OPTIONS ---
      '-max_muxing_queue_size', '1024', // Evita erro "Too many packets buffered"
      '-movflags', '+faststart', // Otimiza o MP4 para reprodução web (move o átomo MOOV para o início)

      normalizedPath
    ];

    // Inicia o processo
    const ffmpeg = spawn('ffmpeg', args, {
      //stdio: ['ignore', 'inherit', 'inherit'] // Mantém logs no console para debug
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Falha ao iniciar o ffmpeg: ${err.message}`));
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(normalizedPath);
      } else {
        reject(new Error(`ffmpeg encerrou com código de erro: ${code}`));
      }
    });
  });
}