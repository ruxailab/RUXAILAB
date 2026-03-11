// .github/scripts/generate_qc_report.js

const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
  const jsonPath = path.join(process.env.GITHUB_WORKSPACE, '.github', 'quality_control_data.json');
  
  // 1. Ler o arquivo atual
  let qcData;
  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    qcData = JSON.parse(rawData);
  } catch (error) {
    core.setFailed(`Erro ao ler o arquivo JSON: ${error.message}`);
    return;
  }

  // 2. Determinar o dia da semana atual em UTC
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getUTCDay()];

  // Se for fim de semana, logamos e paramos (ou agrupamos em Sexta, depende da regra)
  if (today === 'Sat' || today === 'Sun') {
    core.info('Final de semana. Nenhuma métrica diária de QC coletada no Check Sheet para Sat/Sun.');
    return;
  }

  // Obter as variáveis de falhas passadas pelo Workflow
  // Elas vêm do steps context no arquivo yml
  const testErrorsCount = parseInt(process.env.TEST_ERRORS || '0', 10);
  const securityIssuesCount = parseInt(process.env.SECURITY_ISSUES || '0', 10);
  const codeSmellsCount = parseInt(process.env.CODE_SMELLS || '0', 10);

  core.info(`Coletado hoje (${today}): Testes: ${testErrorsCount}, Segurança: ${securityIssuesCount}, Code Smells: ${codeSmellsCount}`);

  // 3. Atualizar as contagens diárias
  qcData.records.forEach(record => {
    switch (record.occurrence) {
      case 'Test error':
        record.daily_counts[today] += testErrorsCount;
        break;
      case 'Security vulnerability':
        record.daily_counts[today] += securityIssuesCount;
        break;
      case 'Code smells/Bugs':
        record.daily_counts[today] += codeSmellsCount;
        break;
      default:
        // Other/Misc não mapeado automaticamente para este trigger
        break;
    }
    
    // Recalcular o Total por linha
    record.total = Object.values(record.daily_counts).reduce((sum, val) => sum + val, 0);
  });

  // Recalcular o Grand Total
  qcData.summary.grand_total = qcData.records.reduce((sum, record) => sum + record.total, 0);

  // 4. Salvar o arquivo JSON atualizado
  fs.writeFileSync(jsonPath, JSON.stringify(qcData, null, 2));
  core.info('Arquivo quality_control_data.json atualizado com sucesso.');

  // 5. Gerar o Markdown para o Job Summary
  let mdSummary = `# Quality Control Report (${new Date().toISOString().split('T')[0]})\n\n`;
  mdSummary += `| Defect/Event occurrence | Mon | Tue | Wed | Thu | Fri | TOTAL |\n`;
  mdSummary += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
  
  qcData.records.forEach(r => {
    mdSummary += `| ${r.occurrence} | ${r.daily_counts.Mon} | ${r.daily_counts.Tue} | ${r.daily_counts.Wed} | ${r.daily_counts.Thu} | ${r.daily_counts.Fri} | **${r.total}** |\n`;
  });
  
  mdSummary += `| **GRAND TOTAL** | | | | | | **${qcData.summary.grand_total}** |\n\n`;
  
  mdSummary += `*Workflow triggered by recent CI runs. Data cumulative for the week.*`;

  // Escrever no Github Step Summary
  await core.summary.addRaw(mdSummary).write();
};
