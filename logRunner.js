

const steps = ["Analisando conteúdo", "Criando segmento no disco", "Criando arquivo final", "Limpando pasta temporária"];

export const segmentStatus = { message: '0/0' };

export const currentStatus = { step: 0 };

/**
 * Gera logs de atualização do progresso
 * 
 * @param {string} inputFileName Nome com extensão do arquivo de entrada
 * @param {string} outputFileName Nome com extensão do arquivo de saída
 */
export async function logRunner(inputFileName, outputFileName) {
  while (currentStatus.step < steps.length) {
    // Volta o cursor para o topo do bloco de etapas
    process.stdout.write("\x1b[0;0H"); // Move cursor para linha 0, coluna 0
    process.stdout.write("\x1b[2J");   // Limpa a tela (opcional)

    console.log(`Removendo espaços sem audio!\n`);

    console.log(`Arquivo de entrada "${inputFileName}"\n`);

    steps.forEach((step, i) => {
      if (i < currentStatus.step) {
        console.log(`[✔] ${step}`);
      } else if (i === currentStatus.step) {
        if (currentStatus.step === 1) {
          console.log(`[${segmentStatus.message}] ${step}...`);
        } else {
          console.log(`[~] ${step}...`);
        }
      } else {
        console.log(`[ ] ${step}`);
      }
    });


    await new Promise(res => setTimeout(res, 500));
  }

  console.log(`\nArquivo final gerado "${outputFileName}"`);
  console.log("\nFinalizado!");
}
