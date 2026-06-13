export const meta = {
  name: 'potentials-section-split-fix',
  description: 'Fix /mentor/potentials grouping so Rank 3/4-or-Bonk people split from everyone-else',
  phases: [
    { title: 'Plan', detail: 'Read UnifiedFlagging + intake-summaries, produce exact getter + template edits' },
    { title: 'Implement', detail: 'Apply the membership predicate, getters, and new section' },
    { title: 'Verify', detail: 'Lint + logic-correctness + design-conformance review in parallel' },
  ],
}

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['rootCause', 'jsEdits', 'hbsEdits', 'predicateRule', 'notes'],
  properties: {
    rootCause: { type: 'string', description: 'One-paragraph statement of why all non-personnel people currently land in "Rank 3/4 or Bonk".' },
    jsEdits: { type: 'string', description: 'Exact edits to app/components/unified-flagging.js: new imports, the centralized membership predicate, the corrected rankFlaggedPeople getter (non-personnel AND rank 3/4 or bonk), and a NEW getter for everyone-else (non-personnel AND not rank 3/4 or bonk). Show full replacement snippets.' },
    hbsEdits: { type: 'string', description: 'Exact edits to app/components/unified-flagging.hbs: the NEW conditional section block (title "Other Potential Alphas") iterating the everyone-else getter with <UnifiedFlaggingRow>, mirroring the existing section markup.' },
    predicateRule: { type: 'string', description: 'The precise membership rule for the priority/rank section, in terms of worstRank() and mentorBonkYear(): a person is in "Rank 3/4 or Bonk" iff worstRank(person) is 3 or 4, OR mentorBonkYear(person) !== null. Confirm this matches the existing util semantics (RANK_SEVERITY ordering 4>3>1>2; worstRank returns the rank number not the weight).' },
    notes: { type: 'string', description: 'Risks: keep the predicate centralized so the two getters cannot drift; preserve worst-first ordering in the rank section and the existing Personnel section; do not change personnelFlaggedPeople; keep the reactivity (derive from sortedPeople which reads this.people).' },
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
    correct: { type: 'boolean', description: 'True if the implemented split correctly puts exactly the rank-3 / rank-4 / mentor-bonk (non-personnel) people in "Rank 3/4 or Bonk" and ALL remaining non-personnel people in "Other Potential Alphas", with no double-counting and no one dropped.' },
    issues: { type: 'array', items: { type: 'string' }, description: 'Concrete logic problems: edge cases (rank-2/no-rank, self-bonk vs bonk, in-progress training rank), drift between getters, ordering regressions, people lost/duplicated. Empty if correct.' },
  },
}

phase('Plan')
const plan = await agent(
  `Plan a fix for a grouping bug on /mentor/potentials. The page groups people via the <UnifiedFlagging> component.

BUG: Every person who does NOT have a raised Personnel flag is currently shown under the "Rank 3/4 or Bonk" section — it is a catch-all. It SHOULD only contain people whose worst rank is 3 or 4, OR who were mentor-bonked. Everyone else (non-personnel, no rank 3/4, no bonk) must move to a NEW "Other Potential Alphas" section. The "Personnel Flag Raised" section stays exactly as-is.

READ:
- app/components/unified-flagging.js — current getters: personnelFlaggedPeople (people with personnel_issue), rankFlaggedPeople (sortedPeople.filter(p => !p.personnel_issue) — THE BUG: this is "everyone non-personnel", not "rank 3/4 or bonk"). Note it only imports severityWeight from intake-summaries.
- app/components/unified-flagging.hbs — renders the "Personnel Flag Raised" section then the "Rank 3/4 or Bonk" section; there is NO everyone-else section.
- app/utils/intake-summaries.js — worstRank(person) returns the worst rank NUMBER across all teams (RANK_SEVERITY weights 4>3>1>2, but the returned value is the rank itself, e.g. 3 or 4); mentorBonkYear(person) returns the latest year mentors bonked them (status === 'bonk', NOT self-bonk) or null; severityWeight is used for worst-first sorting.
- DESIGN-SKILLS.md "Section Partitioning" section for the intended pattern and gotchas (centralize the membership rule; keep worst-first ordering in the priority group; Other group is the remainder).

DESIGN GOAL (decided): KEEP the separate "Personnel Flag Raised" section. Among the NON-personnel people, split into:
  (1) "Rank 3/4 or Bonk" — worstRank(person) is 3 or 4, OR mentorBonkYear(person) !== null
  (2) "Other Potential Alphas" — all remaining non-personnel people

Requirements: centralize membership in ONE predicate (e.g. isRankOrBonk(person)) used by both getters so they cannot drift; both rank and other groups derive from sortedPeople (preserve worst-first ordering and reactivity); import worstRank and mentorBonkYear; do NOT touch personnelFlaggedPeople or the noteOverrides reactivity. Output exact paste-ready snippets.`,
  { schema: PLAN_SCHEMA, phase: 'Plan' }
)

log(`Plan ready. Root cause: ${plan.rootCause.slice(0, 120)}…`)

phase('Implement')
const impl = await agent(
  `Implement this /mentor/potentials grouping fix EXACTLY per the plan. Edit the working tree.

ROOT CAUSE: ${plan.rootCause}

JS EDITS (app/components/unified-flagging.js):
${plan.jsEdits}

HBS EDITS (app/components/unified-flagging.hbs):
${plan.hbsEdits}

MEMBERSHIP RULE: ${plan.predicateRule}

NOTES TO HONOR: ${plan.notes}

Read each file, apply with Edit. Keep personnelFlaggedPeople and the noteOverrides-based reactive 'people' getter untouched. The new "Other Potential Alphas" section must mirror the existing section markup (uf-row-section / uf-row-section-title / uf-row-stack, <UnifiedFlaggingRow> with @person/@year/@showGender/@onSubmit, key="id") and be wrapped in its own {{#if}} on length. Report files changed and a summary.`,
  { schema: IMPL_SCHEMA, phase: 'Implement' }
)

log(`Edited: ${impl.filesChanged.join(', ')}`)

phase('Verify')
const [lint, logic, design] = await parallel([
  () => agent(
    `Run \`npm run lint:hbs\` and \`npm run lint:js\` for this Ember project. Report pass/fail and quote any errors tied to the changed files: ${impl.filesChanged.join(', ')}. (There is no lint:css script in this project — do not run it.)`,
    { schema: LINT_SCHEMA, phase: 'Verify', label: 'lint' }
  ),
  () => agent(
    `Adversarially verify the grouping LOGIC in the edited app/components/unified-flagging.js (read it, plus app/utils/intake-summaries.js for worstRank/mentorBonkYear semantics).

Confirm: (1) "Rank 3/4 or Bonk" contains exactly the non-personnel people with worstRank 3 or 4 OR a mentor bonk; (2) "Other Potential Alphas" contains ALL other non-personnel people; (3) the union of all three groups equals the full people list with NO double-counting and NO one dropped; (4) the membership rule is centralized (single predicate) so the two getters can't drift; (5) worst-first ordering is preserved in the rank section; (6) edge cases handled: rank-2 / no-rank go to Other, self-bonk does NOT count as bonk, an in-progress (not slot_has_ended) training rank does not push someone into the rank section. List concrete problems.`,
    { schema: LOGIC_SCHEMA, phase: 'Verify', label: 'logic-check' }
  ),
  () => agent(
    `Check the edited app/components/unified-flagging.hbs against the DESIGN-SKILLS.md "Section Partitioning" pattern. Confirm the new "Other Potential Alphas" section uses uf-row-section / uf-row-section-title / uf-row-stack and <UnifiedFlaggingRow key="id">, is independently conditional on its getter's length, and sits after the rank section. Report deviations as a list (empty if conformant).`,
    { schema: LOGIC_SCHEMA, phase: 'Verify', label: 'design-review' }
  ),
])

return {
  filesChanged: impl.filesChanged,
  implementationSummary: impl.summary,
  lint: lint ?? { passed: false, output: 'lint agent did not return' },
  logicCheck: logic ?? { correct: false, issues: ['logic agent did not return'] },
  designReview: design ?? { correct: false, issues: ['design agent did not return'] },
}
