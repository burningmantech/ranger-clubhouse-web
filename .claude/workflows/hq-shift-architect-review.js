export const meta = {
  name: 'hq-shift-architect-review',
  description: 'Harsh Software Architect review of the /hq/:person_id/shift route (route, controller, template, and components) with verified findings and refactored code',
  whenToUse: 'When you want a structured architectural review of the HQ shift route — severity-ranked findings (bugs/security/perf/maintainability/DRY/KISS) plus a refactored example.',
  phases: [
    { title: 'Survey', detail: 'Map the route data flow, shared services, and cross-file patterns' },
    { title: 'Review', detail: 'One reviewer per file-group emits severity-ranked findings' },
    { title: 'Verify', detail: 'Adversarially verify each Critical/High finding against the code' },
    { title: 'Synthesize', detail: 'Assemble report + refactored code from verified findings' },
  ],
}

// ---- Work-list: every file the /hq/:person_id/shift route touches, grouped ----
const BATCHES = [
  { key: 'route',          files: ['app/routes/hq/shift.js'] },
  { key: 'controller',     files: ['app/controllers/hq/shift.js'] },        // 490 lines — reviewed alone
  { key: 'template',       files: ['app/templates/hq/shift.hbs'] },
  { key: 'check-in-out',   files: ['app/components/shift-check-in-out.js', 'app/components/shift-check-in-out.hbs'] }, // 792 combined
  { key: 'check-in-alerts',files: ['app/components/shift-check-in-alerts.js', 'app/components/shift-check-in-alerts.hbs'] },
  { key: 'pogs',           files: ['app/components/hq-pogs.js', 'app/components/hq-pogs.hbs'] }, // 655 combined
  { key: 'asset-table',    files: ['app/components/hq-asset-table.js', 'app/components/hq-asset-table.hbs'] },
  { key: 'provisions',     files: ['app/components/hq-provision-info.js', 'app/components/hq-provision-info.hbs', 'app/components/hq-shift-manage-section.hbs'] },
  { key: 'timesheet',      files: ['app/components/hq-timesheet-verification.js', 'app/components/hq-timesheet-verification.hbs'] },
  { key: 'todo',           files: ['app/components/hq-todo-task.hbs'] },
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

const REVIEW_RUBRIC = `You are a harsh, senior Software Architect reviewing PRODUCTION code for the /hq/:person_id/shift route of an Ember.js 5 (Octane/Glimmer) + Ember Data app. The route shows a Ranger's shift-management HQ page: check in/out, assets, provisions/pogs, tickets, timesheet verification, todo tasks.
Read every listed file IN FULL with the Read tool before judging. When a finding depends on a model, service, or sibling component, open that file to confirm before asserting. Evaluate against ALL of:
1. Bugs: logic errors, off-by-one, null/undefined handling, async/await races, unhandled promise rejections, stale @tracked state, incorrect ember-changeset usage.
2. Security: injection, missing auth/permission checks, PII/data exposure, unsafe {{html}} / trusted output, IDOR on person_id.
3. Performance: N+1 store queries, redundant findAll/queries in loops, work in getters that should be cached, memory leaks (uncleared timers/intervals/observers).
4. Maintainability: naming, cyclomatic complexity, duplication (DRY), magic numbers/strings, dead/commented code.
5. Edge cases: what inputs (missing slot, null person, empty assets, double check-in, concurrent action) would break this.
6. Code smells: deeply nested conditionals, long methods, copy-paste action handlers, template logic that belongs in JS.
7. Files that should be split into multiple files/components.
8. Poor or inconsistent naming (CSS dash-case, fields snake_case, vars camelCase, constants UPPER_SNAKE per project conventions).
9. Logic that should be extracted into reusable helpers/services/utilities.

For EVERY issue produce: severity (Critical/High/Medium/Low), file, location (line or named method/section), the specific problem, and a concrete fix.
Be harsh but correct — do NOT invent issues. Only report what is actually in the files. Prefer precise line references.
Critical/High is reserved for real correctness/security problems (data loss, wrong status written, missing auth, crash on common input). Style/duplication/naming is Medium/Low.`

// ---------------------------------------------------------------------------
phase('Survey')
log(`Reviewing /hq/:person_id/shift — ${BATCHES.reduce((n, b) => n + b.files.length, 0)} files across ${BATCHES.length} groups`)

const survey = await agent(
  `Survey the architecture of the /hq/:person_id/shift route in this Ember 5 app. Read app/routes/hq/shift.js and app/controllers/hq/shift.js in full, skim app/templates/hq/shift.hbs, and grep for the 'shift-manage', 'house', 'session', and 'ajax' services it relies on.
Report (as concise prose an architect would put atop a review):
- The data-loading flow: what the route model() hook fetches, how the controller orchestrates state, what services it leans on.
- How shift check-in/out state is represented and mutated, and any shared/duplicated patterns across the child components (hq-pogs, hq-asset-table, shift-check-in-out, etc.).
- Where permission/authorization is (or is not) enforced for acting on another person's shift.
- Cross-cutting conventions and inconsistencies (action-handler boilerplate, error/toast handling, async patterns) that recur and could be centralized.
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
        `Adversarially verify this code-review finding about the /hq/:person_id/shift route. Open the cited file (and any model/service/sibling it depends on) and try to REFUTE it. A finding is NOT real if it mistakes an Ember/Glimmer/Ember-Data idiom for a bug, cites a line that does not say what is claimed, assumes behavior the surrounding code already guards, or is pure opinion dressed as a defect.\n\nFINDING:\nfile: ${f.file}\nlocation: ${f.location}\nseverity: ${f.severity}\ncategory: ${f.category}\nproblem: ${f.problem}\nproposed fix: ${f.fix}\n\nReturn your verdict.`,
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
  `You are the lead Software Architect writing the final review of the /hq/:person_id/shift route in this Ember 5 app. Be harsh, specific, and actionable.

SURVEY:
${survey}

VERIFIED FINDINGS (already adversarially checked; refuted ones removed):
${findingsTable}

Write a Markdown report with these sections:
# /hq/:person_id/shift — Software Architecture Review
## Executive Summary — overall health verdict, top 3 systemic problems, and a maintainability/readability grade (A–F) with justification.
## Findings by Severity — group the findings above under Critical / High / Medium / Low. For each: file:location, what's wrong, how to fix. Merge findings that recur across files into a single "systemic" entry naming all affected files.
## DRY / KISS Assessment — the biggest duplication and over-complexity patterns, with the concrete shared helper/service/util API you'd extract (function signatures).
## File-Split Recommendations — which files are doing too much and how to decompose them.
## Refactored Example — pick the single file with the worst combination of issues from the findings, and provide a COMPLETE refactored version in a fenced code block that fixes the issues while preserving identical functionality. Above it, state which file and why. If you extract a shared helper/service, show it too (fenced), and a 2-3 line note of how the refactored file now uses it.
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
