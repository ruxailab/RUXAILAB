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

  // 3. Atualizar as contagens diárias (Sobrescrever para refletir o estado atual do dia)
  qcData.records.forEach(record => {
    switch (record.occurrence) {
      case 'Test error':
        record.daily_counts[today] = testErrorsCount;
        break;
      case 'Security vulnerability':
        record.daily_counts[today] = securityIssuesCount;
        break;
      case 'Code smells/Bugs':
        record.daily_counts[today] = codeSmellsCount;
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

  // --- Rastreamento Automático de Issues e Labels ---
  try {
    core.info('Buscando issues abertas no repositório...');
    
    // Buscar todas as issues abertas (o GitHub API retorna PRs como issues também, filtraremos depois se necessário)
    const { data: openIssues } = await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      per_page: 100
    });
    
    // Apenas issues reais (não Pull Requests)
    const realIssues = openIssues.filter(issue => !issue.pull_request);
    
    let bugCount = 0;
    let enhancementCount = 0;
    let docsCount = 0;
    
    realIssues.forEach(issue => {
      const labels = issue.labels.map(l => l.name.toLowerCase());
      if (labels.includes('bug')) bugCount++;
      if (labels.includes('enhancement')) enhancementCount++;
      if (labels.includes('documentation') || labels.includes('docs')) docsCount++;
    });

    // Atualizar no schema do JSON
    if (!qcData.issues_tracking) {
        qcData.issues_tracking = { open_bugs: 0, open_enhancements: 0, open_docs: 0, total_open: 0 };
    }
    
    qcData.issues_tracking.open_bugs = bugCount;
    qcData.issues_tracking.open_enhancements = enhancementCount;
    qcData.issues_tracking.open_docs = docsCount;
    qcData.issues_tracking.total_open = realIssues.length;
    
    core.info(`Issues trackeadas: ${realIssues.length} total, Bugs: ${bugCount}, Enhancements: ${enhancementCount}, Docs: ${docsCount}`);
    
  } catch (error) {
    core.warning(`Erro ao buscar e contabilizar issues: ${error.message}`);
  }
  // ----------------------------------------------------

  // 4. Salvar o arquivo JSON atualizado
  fs.writeFileSync(jsonPath, JSON.stringify(qcData, null, 2));
  core.info('Arquivo quality_control_data.json atualizado com sucesso.');

  // 5. Gerar o Markdown para o Job Summary
  let mdSummary = `# 🛡️ Quality Control Daily Report (${new Date().toISOString().split('T')[0]})\n\n`;
  mdSummary += `### 📊 Weekly Cumulative Defects (Check Sheet)\n\n`;
  mdSummary += `| Defect/Event occurrence | Mon | Tue | Wed | Thu | Fri | TOTAL |\n`;
  mdSummary += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
  
  qcData.records.forEach(r => {
    mdSummary += `| ${r.occurrence} | ${r.daily_counts.Mon} | ${r.daily_counts.Tue} | ${r.daily_counts.Wed} | ${r.daily_counts.Thu} | ${r.daily_counts.Fri} | **${r.total}** |\n`;
  });
  
  mdSummary += `| **GRAND TOTAL** | | | | | | **${qcData.summary.grand_total}** |\n\n`;
  
  if (qcData.issues_tracking) {
    mdSummary += `### 🐛 Active Issues Analysis (by Labels)\n\n`;
    mdSummary += `| Status | Bug 🐛 | Enhancement ✨ | Docs 📝 | Total (Open)\n`;
    mdSummary += `| :--- | :---: | :---: | :---: | :---: |\n`;
    mdSummary += `| Count | ${qcData.issues_tracking.open_bugs} | ${qcData.issues_tracking.open_enhancements} | ${qcData.issues_tracking.open_docs} | **${qcData.issues_tracking.total_open}** |\n\n`;
  }

  mdSummary += `--- \n`;
  mdSummary += `*💡 This report aggregates results from all active pipelines for today. Values represent the current state of failures.*`;

  // Escrever no Github Step Summary
  await core.summary.addRaw(mdSummary).write();
};
