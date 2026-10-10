# AI integration points

`index.ts` defines the contracts for six planned features. None is active: `getAIProvider()` returns `null`, the
API route `/api/ai/[feature]` answers `501 Not Implemented`, and every button that would use AI is disabled with a
"not connected" explanation.

| Feature                      | Where it surfaces                         | Contract                                                                                  |
| ---------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Property recommendations     | Website (saved properties, listing pages) | `recommendProperties`                                                                     |
| Natural-language search      | Website search box                        | `parseSearchQuery` — a rule-based version (`src/lib/search/interpret.ts`) is already live |
| Lead qualification assistant | CRM lead page                             | `qualifyLead`                                                                             |
| Inquiry categorisation       | Lead capture pipeline                     | `categoriseInquiry`                                                                       |
| Listing description drafting | Property admin                            | `draftDescription`                                                                        |
| Market report generation     | CRM                                       | `generateMarketReport` — must only use cited, verified sources                            |

Lead scoring is deliberately **not** an AI feature: it is a transparent rules engine (`src/lib/scoring`,
weights in `src/config/lead-scoring.ts`) whose every point is explained in the CRM.

## Adding a provider

1. Create `providers/<name>.ts` implementing `AIProvider` with the provider's official SDK. Keep the API key on the
   server (`AI_API_KEY`), never in `NEXT_PUBLIC_*` variables.
2. Return it from `getAIProvider()` when `AI_PROVIDER` and `AI_API_KEY` are set.
3. Wire each feature in `src/app/api/ai/[feature]/route.ts`, validate the model's output with zod before use, and
   keep humans in the loop — drafts are suggestions, nothing is sent to clients automatically.
4. Update the Integrations page copy once a feature is genuinely working.
