// .github/scripts/generate_pr_summary.js

module.exports = async ({ github, context, core }) => {
  const { workflow_run } = context.payload;
  
  if (!workflow_run) {
    core.info('Not a workflow_run event. Skipping.');
    return;
  }
  
  const headSha = workflow_run.head_sha;
  
  core.info(`Fetching check runs for SHA: ${headSha}`);
  
  // 1. Fetch all check runs for the commit
  const { data: checksData } = await github.rest.checks.listForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: headSha,
    per_page: 100
  });
  
  let checkRuns = checksData.check_runs;
  
  // Exclude this summary workflow itself to avoid confusion
  checkRuns = checkRuns.filter(check => check.name !== 'PR/Commit Checks Summary');
  
  if (checkRuns.length === 0) {
    core.info('No check runs found for this commit.');
    return;
  }
  
  let allSuccess = true;
  let mdTable = '| Check Name | Status | Conclusion |\n';
  mdTable += '| :--- | :---: | :---: |\n';
  
  checkRuns.forEach(check => {
    const name = check.name;
    const status = check.status === 'completed' ? 'Completed 🏁' : 'In Progress ⏳';
    
    let conclusionIcon = '❓';
    let conclusionText = 'Waiting ⏱️';
    
    if (check.conclusion) {
      if (check.conclusion === 'success') conclusionIcon = '✅';
      else if (check.conclusion === 'failure') conclusionIcon = '❌';
      else if (check.conclusion === 'cancelled') conclusionIcon = '🚫';
      else if (check.conclusion === 'skipped') conclusionIcon = '⏭️';
      else conclusionIcon = '⚠️';
      
      conclusionText = `${check.conclusion.charAt(0).toUpperCase() + check.conclusion.slice(1)} ${conclusionIcon}`;
    }
    
    if (check.conclusion !== 'success' && check.conclusion !== 'skipped' && check.conclusion !== 'neutral') {
      allSuccess = false;
    }
    
    mdTable += `| **${name}** | ${status} | ${conclusionText} |\n`;
  });
  
  const finalStatus = allSuccess ? '### 🎉 All checks passed!' : '### ⚠️ Some checks failed or are still running.';
  const markdownContent = `## 📊 Pipeline Checks Summary\n\n${finalStatus}\n\n${mdTable}\n*Commit SHA: \`${headSha.substring(0, 7)}\`*`;
  
  // 2. Add Job Summary (shows on the Actions tab even for commits that have no PR)
  await core.summary.addRaw(markdownContent).write();
  core.info('Added job summary.');
  
  // 3. Fetch associated PRs for this commit
  const { data: commitPrs } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: headSha,
  });
  
  if (commitPrs && commitPrs.length > 0) {
    for (const pr of commitPrs) {
      const prNumber = pr.number;
      core.info(`Associated PR found: #${prNumber}. Looking for existing comments...`);
      
      // Find existing comment by this bot to update it instead of spamming
      const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
      });
      
      const botComment = comments.find(c => c.user && c.user.type === 'Bot' && c.body.includes('## 📊 Pipeline Checks Summary'));
      
      if (botComment) {
        core.info(`Updating existing comment (ID: ${botComment.id}) on PR #${prNumber}.`);
        await github.rest.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: botComment.id,
          body: markdownContent
        });
      } else {
        core.info(`Creating new comment on PR #${prNumber}.`);
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: prNumber,
          body: markdownContent
        });
      }
    }
  } else {
    core.info('No pull requests associated with this run, skipping PR comment.');
  }
};
