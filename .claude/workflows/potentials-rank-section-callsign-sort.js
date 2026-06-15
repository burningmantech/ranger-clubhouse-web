export const meta = {
  name: 'potentials-rank-section-callsign-sort',
  description: 'Sort the /mentor/potentials "Rank 3/4 or Bonk" section alphabetically by callsign',
  phases: [
    { title: 'Plan', detail: 'Read UnifiedFlagging getters, produce the exact rankFlaggedPeople sort edit' },
    { title: 'Implement', detail: 'Apply the callsign sort to the rank section' },
    { title: 'Verify', detail: 'Lint + logic-correctness review in parallel' },
  ],
}

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['currentBehavior', 'jsEdit', 'notes'],
  properties: {
    currentBehavior: { type: 'string', description: 'Why bonk-only (no rank 3/4) people currently sort below rank 3/4 people in this section.' },
    jsEdit: { type: 'string', description: 'Exact paste-ready replacement for the rankFlaggedPeople getter in app/components/unified-flagging.js: filter the SAME members (non-personnel AND isRankOrBonk) but sort alphabetically by callsign via localeCompare, mirroring how otherPeople is now sorted. Derive from this.people (not sortedPeople) so the severity order is not pre-imposed, and operate on the fresh filtered array so this.people is not mutated.' },
    notes: { type: 'string', description: 'Risks: membership must stay identical (isRankOrBonk unchanged); do not touch personnelFlaggedPeople (stays worst-first) or otherPeople; preserve reactivity (read this.people); handle missing callsign with ?? "".' },
  },
}

const IMPL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['filesChanged', 'summary'],
  properties: {
    filesChanged: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
}

const LINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['passed', 'output'],
  properties: { passed: { type: 'boolean' }, output: { type: 'string' } },
}

const LOGIC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['correct', 'issues'],
  properties: {
    correct: { type: 'boolean', description: 'True if rankFlaggedPeople now sorts alphabetically by callsign across the WHOLE section (rank 3/4 and bonk-only intermixed), membership is unchanged, and reactivity/other getters are intact.' },
    issues: { type: 'array', items: { type: 'string' }, description: 'Concrete problems: membership changed, this.people mutated, personnelFlaggedPeople/otherPeople affected, callsign null-handling, severity ordering still leaking in. Empty if correct.' },
  },
}

phase('Plan')
const plan = await agent(
  `Plan a sort-behavior fix for the /mentor/potentials "Rank 3/4 or Bonk" section, rendered by <UnifiedFlagging>.

DECIDED BEHAVIOR: the ENTIRE "Rank 3/4 or Bonk" section must be sorted alphabetically by callsign — rank 3/4 people and bonk-only people fully intermixed. Worst-first ordering is intentionally dropped for THIS section only.

BUG TODAY: rankFlaggedPeople derives from sortedPeople (severityWeight desc, callsign tiebreak), so people who are in the section only because of a mentor bonk (no rank 3/4 → low severityWeight) sort BELOW the rank 3/4 people instead of being alphabetized with them.

READ:
- app/components/unified-flagging.js — note the getters: sortedPeople (severity desc), personnelFlaggedPeople, isRankOrBonk (the membership predicate), rankFlaggedPeople (currently sortedPeople.filter(non-personnel && isRankOrBonk)), otherPeople (already changed to: this.people.filter(...).sort by callsign localeCompare). Match otherPeople's sorting approach.
- DESIGN-SKILLS.md "Section Partitioning" for context (note: this change deliberately overrides the doc's worst-first-for-priority guidance per an explicit product decision).

GOAL: change ONLY rankFlaggedPeople so it keeps the exact same membership (non-personnel AND isRankOrBonk) but is sorted alphabetically by callsign using (a.callsign ?? '').localeCompare(b.callsign ?? ''), derived from this.people (so the severity sort is not pre-applied) and operating on the fresh filtered array (no mutation of this.people). Do NOT change personnelFlaggedPeople (must stay worst-first) or otherPeople. Output the exact replacement snippet for the rankFlaggedPeople getter (with an updated comment).`,
  { schema: PLAN_SCHEMA, phase: 'Plan' }
)

log(`Plan ready. ${plan.currentBehavior.slice(0, 120)}…`)

phase('Implement')
const impl = await agent(
  `Implement this sort fix EXACTLY per the plan. Edit the working tree.

CURRENT BEHAVIOR: ${plan.currentBehavior}

JS EDIT (app/components/unified-flagging.js — rankFlaggedPeople getter only):
${plan.jsEdit}

NOTES TO HONOR: ${plan.notes}

Read app/components/unified-flagging.js and apply with Edit. Change ONLY the rankFlaggedPeople getter (and its comment). Leave personnelFlaggedPeople (worst-first), isRankOrBonk, otherPeople, sortedPeople, the people getter, noteOverrides, and noteSubmitted untouched. Report files changed and a summary.`,
  { schema: IMPL_SCHEMA, phase: 'Implement' }
)

log(`Edited: ${impl.filesChanged.join(', ')}`)

phase('Verify')
const [lint, logic] = await parallel([
  () => agent(
    `Run \`npm run lint:hbs\` and \`npm run lint:js\` for this Ember project. Report pass/fail and quote any errors tied to ${impl.filesChanged.join(', ')}. (No lint:css script exists — do not run it.)`,
    { schema: LINT_SCHEMA, phase: 'Verify', label: 'lint' }
  ),
  () => agent(
    `Adversarially verify the edited app/components/unified-flagging.js (read it, plus app/utils/intake-summaries.js for context).

Confirm: (1) rankFlaggedPeople membership is UNCHANGED — still exactly non-personnel AND isRankOrBonk (worstRank 3/4 OR mentor bonk); (2) it is now sorted alphabetically by callsign across the WHOLE section, with rank 3/4 and bonk-only people intermixed (no severityWeight ordering leaking in — it must NOT derive from sortedPeople, or if it does the final .sort fully re-orders by callsign); (3) this.people is NOT mutated (sort runs on the filtered copy); (4) missing callsign handled via ?? ''; (5) personnelFlaggedPeople still sorts worst-first and otherPeople still sorts by callsign — both untouched; (6) reactivity preserved (reads this.people). List concrete problems; empty if correct.`,
    { schema: LOGIC_SCHEMA, phase: 'Verify', label: 'logic-check' }
  ),
])

return {
  filesChanged: impl.filesChanged,
  implementationSummary: impl.summary,
  lint: lint ?? { passed: false, output: 'lint agent did not return' },
  logicCheck: logic ?? { correct: false, issues: ['logic agent did not return'] },
}
