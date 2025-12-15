#!/usr/bin/env node

import { applyAudioNormalization } from './src/applyAudioNormalization.js'
import { selectVideos } from './src/listVideos.js'


const [originalPath] = process.argv.slice(2);
if (!originalPath) {
  throw new Error("Path with problem");
}

if (!originalPath) {
  throw new Error('Path is required')
}

await selectVideos(originalPath)
  .then(async (videos) => {
    const total = videos.length

    console.log(`🎬 ${total} vídeo(s) encontrado(s)\n`)

    let index = 0

    for (const videoPath of videos) {
      index++

      console.log(`▶️  [${index}/${total}] Processando:`)
      console.log(`    '${videoPath}'`)

      const start = Date.now()

      try {
        const output = await applyAudioNormalization(videoPath)

        const duration = ((Date.now() - start) / 1000).toFixed(1)

        console.log(`    ✅ Concluído em ${duration}s`)
        console.log(`    📁 Saída: '${output}'\n`)
      } catch (error) {
        console.error(`    ❌ Erro ao processar:`)
        console.error(`    '${videoPath}'`)
        console.error(error)
        console.log()
      }
    }

    console.log('🏁 Processamento finalizado')
  })
  .catch((err) => {
    console.error('❌ Erro ao selecionar vídeos')
    console.error(err)
  })