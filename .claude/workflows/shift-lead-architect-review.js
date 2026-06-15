export const meta = {
  name: 'shift-lead-architect-review',
  description: 'Harsh Software Architect review of the /reports/shift-lead route (route, controller, template, ShiftLeadTable component) with verified findings and refactored code',
  whenToUse: 'When you want a structured architectural review of the Shift Lead Report route — severity-ranked findings (bugs/security/perf/maintainability/DRY/KISS/edge-cases) plus a refactored example.',
  phases: [
    { title: 'Survey', detail: 'Map the data flow: route model() -> setProperties rehydration -> template/component render' },
    { title: 'Review', detail: 'One reviewer per file-group emits severity-ranked findings' },
    { title: 'Verify', detail: 'Adversarially verify each Critical/High finding against the code' },
    { title: 'Synthesize', detail: 'Assemble report + refactored code from verified findings' },
  ],
}

// ---- Work-list: every file the /reports/shift-lead route touches ----
// The route's model() only fetches the shift-period list; the controller does
// the heavy lifting — two API calls (scheduled vs on-duty) whose results are
// dumped onto `this` via setProperties() and then "rehydrated" (slot/position
// pointers re-attached, rows sorted) by four near-duplicate private methods.
// The template renders summary sections + a below-min table; ShiftLeadTable
// renders each signup group. Selectable + DIRT_SHINY_PENNY are supporting.
const BATCHES = [
  { key: 'route',      files: ['app/routes/reports/shift-lead.js'] },
  { key: 'controller', files: ['app/controllers/reports/shift-lead.js'] }, // 227 lines — the core, reviewed alone
  { key: 'template',   files: ['app/templates/reports/shift-lead.hbs'] },
  { key: 'component',  files: ['app/components/shift-lead-table.js', 'app/components/shift-lead-table.hbs'] },
]

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'category', 'file', 'location', 'problem', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
          category: { type: 'string', enum: [
            'Bug', 'Security', 'Performance', 'Maintainability',
            'EdgeCase', 'CodeSmell', 'FileSplit', 'Naming', 'Extraction',
          ]},
          file: { type: 'string' },
          location: { type: 'string', description: 'Line number(s) or named section/method' },
          problem: { type: 'string', description: 'What is wrong — be specific and harsh' },
          fix: { type: 'string', description: 'Concrete remediation' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isReal', 'adjustedSeverity', 'reasoning'],
  properties: {
    isReal: { type: 'boolean', description: 'False if the finding is wrong, a non-issue, or an Ember/Glimmer idiom mistaken for a defect' },
    adjustedSeverity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low', 'Invalid'] },
    reasoning: { type: 'string' },
  },
}

const REVIEW_RUBRIC = `You are a harsh, senior Software Architect reviewing PRODUCTION code for the /reports/shift-lead route of an Ember.js 5 (Octane/Glimmer) + Ember Data app. The page is the "Shift Lead Report": a shift lead picks a year + shift period (or "Currently On Duty"), and the app fetches and displays who is signed up / on duty (dirt rangers, command staff, special teams), green-dot head counts, and which positions are below minimum staffing.

DATA FLOW you must understand before judging:
- app/routes/reports/shift-lead.js model() fetches ONLY the shift-period list (slot/dirt-shift-times) and stashes \`this.year\`; setupController seeds dirtShiftTimes/year/shiftSelect/isOnDuty.
- The CONTROLLER does everything else. changeShift() POSTs to slot/shift-lead-report; onDutyAction() GETs timesheet/on-duty-shift-lead-report. BOTH do \`setProperties(this, result)\` — i.e. they splat ARBITRARY snake_case API keys (slots, positions, below_min_positions, non_dirt_signups, command_staff_signups, dirt_signups, green_dot_total, now, ...) directly onto the controller instance, most of which are NOT declared @tracked.
- Then a "rehydrate" step re-attaches slot/position object pointers and sorts rows. There are FOUR near-duplicate private methods: _rehydrateResults / _rehydrateOnDutyResults (below-min table) and _rehydratePeople / _rehydrateOnDutyPeople (signup rows). The sort comparator (shiny-penny title forced to '1111', title localeCompare descending, begins ascending, years descending) is copy-pasted.

Read every listed file IN FULL with the Read tool before judging. When a finding depends on a util, constant, base class, or sibling component (e.g. app/utils/selectable.js, clubhouse/constants/positions DIRT_SHINY_PENNY, clubhouse-route, clubhouse-controller, the ajax/house/toast services, YearSelect, LargeSelect, UiTable, ShiftLeadTable, PersonLink), OPEN that file to confirm before asserting. Evaluate against ALL of:
1. Bugs: logic errors, off-by-one, null/undefined handling (note _rehydrateResults dereferences slot.position_id and positions[...] BEFORE its \`if (!slot || !positions)\` guard, and the guard tests the whole \`positions\` map rather than the looked-up \`position\`), async races / unhandled rejections, stale @tracked state, sort comparators that don't return 0 correctly.
2. Security: PII / data exposure (callsigns, gender, pronouns, emergency info), missing auth/permission gating for who may view a shift-lead report, IDOR via year/shift params, anything trusting raw API shape.
3. Performance: redundant work in getters re-running on every access (periodOptions rebuilds + re-groups on every render), unnecessary loops, in-place sort of a tracked array after reassignment, mutating API objects in a forEach then sorting.
4. Maintainability: duplication (DRY) — the FOUR rehydrate methods and the duplicated sort comparator are the headline; magic value '1111' for shiny-penny ordering; setProperties() splatting untracked snake_case fields onto the controller.
5. Edge cases: what inputs break this? — null/empty dirtShiftTimes, a slot id in below_min_positions missing from \`slots\`, a person whose slot_id/position_id is absent from the maps, position with no title, green_dot_total falsy vs 0, switching between on-duty and scheduled without clearing prior state, year with no shifts.
6. Code smells / overly complex nested logic: for...in over a groupBy object (insertion-order reliance), deeply nested template conditionals, template logic that belongs in JS getters.
7. Files/sections that should be SPLIT: is the controller doing route-model work? should rehydration/sorting move to a util or the model layer? is the .hbs mixing summary + table + legend that belong in components?
8. Poor or INCONSISTENT naming (project convention: CSS dash-case, form fields snake_case, vars/methods camelCase, constants UPPER_SNAKE, array/object constants Capitalized). Flag the snake_case @tracked fields (incoming_positions, non_dirt_signups, command_staff_signups, dirt_signups, green_dot_total, green_dot_females) sitting next to camelCase ones (dirtShiftTimes, belowMinPositions, shiftSelect, shiftStart).
9. Logic that should be EXTRACTED into reusable helpers/utils (a single rehydrate(people, {slots, positions, bySlot}) + one shared comparator; a shiny-penny sort-key helper).

TEMPLATE-SPECIFIC: app/templates/reports/shift-lead.hbs is a CONTROLLER template, so component-arg syntax \`@isOnDuty\` does NOT resolve there — only \`this.isOnDuty\` does. Inspect the below-min table's "On Duty / Signed Up" cell (around line 87, \`{{#if @isOnDuty}}\`) and decide whether it silently always takes the else branch. Verify before asserting.

For EVERY issue produce: severity (Critical/High/Medium/Low), file, location (line or named method/section), the specific problem, and a concrete fix.
Be harsh but correct — do NOT invent issues. Only report what is actually in the files. Prefer precise line references.
Critical/High is reserved for real correctness/security problems (crash on common input, wrong count/column shown, PII exposed, missing auth). Style/duplication/naming is Medium/Low.`

// ---------------------------------------------------------------------------
phase('Survey')
log(`Reviewing /reports/shift-lead — ${BATCHES.reduce((n, b) => n + b.files.length, 0)} files across ${BATCHES.length} groups`)

const survey = await agent(
  `Survey the architecture of the /reports/shift-lead route in this Ember 5 (Octane/Glimmer) app. Read app/routes/reports/shift-lead.js, app/controllers/reports/shift-lead.js, app/templates/reports/shift-lead.hbs, and app/components/shift-lead-table.{js,hbs} IN FULL. Also open app/utils/selectable.js and the DIRT_SHINY_PENNY constant (clubhouse/constants/positions), and skim the clubhouse-route / clubhouse-controller base classes plus the ajax/house services the controller leans on.
Report (as concise prose an architect would put atop a review):
- The data-loading flow: what the route model() fetches vs what the controller fetches in changeShift()/onDutyAction(), and how \`setProperties(this, result)\` splats raw snake_case API keys onto the controller (which ones are declared @tracked and which are not).
- The "rehydrate" path: how _rehydrateResults/_rehydrateOnDutyResults and _rehydratePeople/_rehydrateOnDutyPeople re-attach slot/position pointers and sort, and where they duplicate each other (the shiny-penny '1111' sort comparator especially).
- Render path: how periodOptions builds LargeSelect groups (and whether it recomputes on every access), how the template's summary sections + below-min table read state, and what ShiftLeadTable renders per signup group.
- Cross-cutting conventions and inconsistencies (snake_case vs camelCase @tracked fields, untracked splatted fields, the @isOnDuty vs this.isOnDuty template arg question, null-handling order in rehydrate) that recur and could be centralized.
Return a structured prose summary.`,
  { label: 'survey', phase: 'Survey' }
)

// ---------------------------------------------------------------------------
// Review -> Verify, pipelined per group. Each group's serious findings verify
// as soon as that group's review completes.
const reviewed = await pipeline(
  BATCHES,
  (batch) => agent(
    `${REVIEW_RUBRIC}\n\nReview ONLY these files (read each fully first):\n${batch.files.map(f => '- ' + f).join('\n')}\n\nReturn all findings.`,
    { label: `review:${batch.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }
  ).then(r => ({ batch: batch.key, findings: (r && r.findings) || [] })),

  (review) => {
    const serious = review.findings.filter(f => f.severity === 'Critical' || f.severity === 'High')
    if (!serious.length) return { ...review, verified: review.findings.map(f => ({ ...f, verdict: null })) }
    return parallel(serious.map(f => () =>
      agent(
        `Adversarially verify this code-review finding about the /reports/shift-lead route. Open the cited file (and any util/constant/base-class/sibling it depends on — e.g. app/utils/selectable.js, DIRT_SHINY_PENNY, clubhouse-controller, ShiftLeadTable) and try to REFUTE it. A finding is NOT real if it mistakes an Ember/Glimmer/Ember-Data idiom for a bug, cites a line that does not say what is claimed, assumes behavior the surrounding code already guards, or is pure opinion dressed as a defect. Pay special attention to template-arg claims (does \`@isOnDuty\` actually resolve in this controller template?) and null-order claims (is the guard truly dead because of an earlier dereference?) — confirm against the real lines.\n\nFINDING:\nfile: ${f.file}\nlocation: ${f.location}\nseverity: ${f.severity}\ncategory: ${f.category}\nproblem: ${f.problem}\nproposed fix: ${f.fix}\n\nReturn your verdict.`,
        { label: `verify:${f.file.split('/').pop()}`, phase: 'Verify', schema: VERDICT_SCHEMA }
      ).then(v => ({ ...f, verdict: v }))
    )).then(verifiedSerious => {
      const minor = review.findings
        .filter(f => f.severity !== 'Critical' && f.severity !== 'High')
        .map(f => ({ ...f, verdict: null }))
      return { ...review, verified: [...verifiedSerious, ...minor] }
    })
  }
)

// ---------------------------------------------------------------------------
// Flatten + drop refuted serious findings; apply adjusted severities.
const allFindings = reviewed.filter(Boolean).flatMap(r => r.verified || [])
const kept = allFindings.filter(f => !f.verdict || f.verdict.isReal)
  .map(f => f.verdict && f.verdict.adjustedSeverity && f.verdict.adjustedSeverity !== 'Invalid'
    ? { ...f, severity: f.verdict.adjustedSeverity }
    : f)
const refuted = allFindings.filter(f => f.verdict && !f.verdict.isReal)

const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
kept.sort((a, b) => (order[a.severity] - order[b.severity]) || a.file.localeCompare(b.file))

log(`Findings: ${kept.length} kept, ${refuted.length} refuted by verification`)

// ---------------------------------------------------------------------------
phase('Synthesize')

const findingsTable = kept.map((f, i) =>
  `${i + 1}. [${f.severity}] (${f.category}) ${f.file} @ ${f.location}\n   PROBLEM: ${f.problem}\n   FIX: ${f.fix}`
).join('\n')

const report = await agent(
  `You are the lead Software Architect writing the final review of the /reports/shift-lead route in this Ember 5 app. Be harsh, specific, and actionable.

SURVEY:
${survey}

VERIFIED FINDINGS (already adversarially checked; refuted ones removed):
${findingsTable}

Write a Markdown report with these sections:
# /reports/shift-lead — Software Architecture Review
## Executive Summary — overall health verdict, top 3 systemic problems, and a maintainability/readability grade (A–F) with justification.
## Findings by Severity — group the findings above under Critical / High / Medium / Low. For each: file:location, what's wrong, how to fix. Merge findings that recur across files into a single "systemic" entry naming all affected files.
## DRY / KISS Assessment — the biggest duplication and over-complexity patterns (the four rehydrate methods + duplicated shiny-penny comparator, setProperties splat, periodOptions recompute), with the concrete shared helper/util API you'd extract (function signatures, e.g. \`rehydrate(people, {slots, positions, useSlot}) \` and \`shiftLeadComparator(useSlot)\`).
## File-Split / Extraction Recommendations — what belongs in a util or the model layer vs the controller, and whether the .hbs should shed sub-components (summary, legend).
## Refactored Example — pick the single file with the worst combination of issues (almost certainly app/controllers/reports/shift-lead.js), and provide a COMPLETE refactored version in a fenced code block that collapses the four rehydrate methods into one parameterized helper, fixes the null-handling order, normalizes naming to camelCase, and preserves IDENTICAL functionality (same API calls, same rendered data, same sort order). Above it, state which file and why. Show any extracted util (fenced) and a 2–3 line note of how the refactored file now uses it. If the @isOnDuty template bug is confirmed, include the one-line .hbs fix too.
## Prioritized Action Plan — an ordered checklist (most impactful first), each item one line.

Do not pad. Every claim must trace to a finding or the survey. Output only the Markdown.`,
  { label: 'synthesize', phase: 'Synthesize' }
)

return {
  reportMarkdown: report,
  stats: {
    groups: BATCHES.length,
    filesReviewed: BATCHES.reduce((n, b) => n + b.files.length, 0),
    findingsKept: kept.length,
    findingsRefuted: refuted.length,
    bySeverity: kept.reduce((acc, f) => ((acc[f.severity] = (acc[f.severity] || 0) + 1), acc), {}),
  },
  refutedFindings: refuted.map(f => ({ file: f.file, problem: f.problem, why: f.verdict.reasoning })),
}
