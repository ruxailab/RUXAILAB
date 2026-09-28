# AI agents for heuristic evaluations

This module keeps model-provider calls behind an injected adapter, stores reusable agent
configurations in `heuristicAgents`, and returns `HeuristicAnswer` objects compatible with
the existing analytics and final-report flow.

```js
import { HeuristicAgentEvaluator, WebTreeBuilder } from '@/ux/Heuristic/ai-agents'

const page = await new WebTreeBuilder().fromUrl(url, { fetcher })
const answer = await new HeuristicAgentEvaluator({ provider }).evaluate({
  agent,
  userId,
  test,
  webTree: page,
})
```

Pass `saveAnswer` to the evaluator and call `evaluateAndSave(...)` to insert the result
through the existing answer store/controller. The generated `userDocId` starts with
`ai-agent:` so it remains a separate evaluator in aggregate analytics.

The provider implements `evaluate(context)` and must return one structured decision per
question. Keep provider credentials on a backend. Browser requests to arbitrary sites are
normally blocked by CORS, so production URL capture should use an allow-listed backend
fetcher. The builder also accepts same-origin HTML or a browser `Document` directly.

The included Firebase Functions implement the production flow through OpenRouter. Configure
`AGENTS_RESPONSE_OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL` in the Functions environment, then
deploy `listAgentModels`, `fetchHeuristicPage` and `evaluateHeuristicPage`. Activate
an agent in a heuristic test, enter the target URL and press **Evaluar**. The resulting answer
is stored in the existing `heuristicAnswers` map. When visual proof is useful, the agent may
request a screenshot of a specific element. The backend captures it, stores it in Firebase
Storage, and attaches it to the corresponding answer; screenshot failures do not discard the
text evaluation. Never expose the key in a `VUE_APP_*`
variable because those values are bundled into the browser application.
