export const meta = {
  name: 'hq-site-checkin-architect-review',
  description: 'Harsh Software Architect review of the /hq/:person_id/site-checkin route (route, parent data-loader route, controller, template) with verified findings and refactored code',
  whenToUse: 'When you want a structured architectural review of the HQ On-Site Registration (site-checkin) route — severity-ranked findings (bugs/security/perf/maintainability/DRY/KISS) plus a refactored example.',
  phases: [
    { title: 'Survey', detail: 'Map the route data flow (parent model hook), controller state machine, and template wizard' },
    { title: 'Review', detail: 'One reviewer per file-group emits severity-ranked findings' },
    { title: 'Verify', detail: 'Adversarially verify each Critical/High finding against the code' },
    { title: 'Synthesize', detail: 'Assemble report + refactored code from verified findings' },
  ],
}

// ---- Work-list: every file the /hq/:person_id/site-checkin route touches ----
// The leaf route only sets up controller state; the parent hq.js model() hook
// loads ALL the data (person, personEvent, eventInfo, assets, attachments...),
// so it is in scope for data-flow / performance / null-handling review.
const BATCHES = [
  { key: 'route',        files: ['app/routes/hq/site-checkin.js'] },
  { key: 'parent-route', files: ['app/routes/hq.js'] },           // model() data-loader + setupController
  { key: 'controller',   files: ['app/controllers/hq/site-checkin.js'] },
  { key: 'template',     files: ['app/templates/hq/site-checkin.hbs'] }, // wizard + agreements + provisions
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

const REVIEW_RUBRIC = `You are a harsh, senior Software Architect reviewing PRODUCTION code for the /hq/:person_id/site-checkin route of an Ember.js 5 (Octane/Glimmer) + Ember Data app. The route is the HQ "On-Site Registration" page: an HQ worker verifies a Ranger's camp/emergency-contact info and radio agreements, optionally checks out an event radio, then marks the person ON SITE via a multi-step UiWizard. The leaf route (app/routes/hq/site-checkin.js) only seeds controller state; the PARENT route (app/routes/hq.js) model() hook loads every record the page uses (person, personEvent, eventInfo, assets, attachments, eventPeriods).

Read every listed file IN FULL with the Read tool before judging. When a finding depends on a model, service, base class, or sibling component (e.g. clubhouse-route, clubhouse-controller, ch-form, ui-wizard, hq-provision-info, asset-checkout-form, person/person-event models, the session/house/toast/modal services), open that file to confirm before asserting. Evaluate against ALL of:
1. Bugs: logic errors, off-by-one, null/undefined handling, async/await races, unhandled promise rejections, stale @tracked state, incorrect ember-changeset usage, mutating a model directly vs via changeset (note finishSiteCheckIn sets person.on_site = true then saves the raw model).
2. Security: injection, missing auth/permission checks, PII/data exposure (emergency_contact, camp_location), IDOR on person_id, the canEditEmergencyContact gate being template-only vs enforced server-side.
3. Performance: N+1 / sequential-await waterfalls in model() (note every property is individually awaited inside the object literal — they run serially, not in parallel), redundant reloads, work in getters that re-runs on every access, memory leaks.
4. Maintainability: naming, duplication (DRY) — note the radio/agreement-authorized messaging is repeated across the template and controller getters; magic strings; controller state duplicated between route setupController and @tracked controller fields (isOnSite vs isContactSaved vs contactSaved mismatch).
5. Edge cases: missing personEvent, null eventInfo.event_period, person already on_site, double-submit, cancelling mid-wizard, Alpha/Prospective branch skipping the radio step, radio_max = 0.
6. Code smells: deeply nested template conditionals, long methods, copy-paste, template logic that belongs in JS getters.
7. Files/components that should be split (the .hbs wizard is large and mixes agreements, provisions, and radio checkout).
8. Poor or inconsistent naming (project convention: CSS dash-case, form fields snake_case, vars camelCase, constants UPPER_SNAKE). Flag the route setting controller.contactSaved while the controller declares @tracked isContactSaved — a dead/mismatched property.
9. Logic that should be extracted into reusable helpers/services/getters (radio-eligibility, authorization, save-with-toast).

For EVERY issue produce: severity (Critical/High/Medium/Low), file, location (line or named method/section), the specific problem, and a concrete fix.
Be harsh but correct — do NOT invent issues. Only report what is actually in the files. Prefer precise line references.
Critical/High is reserved for real correctness/security problems (data loss, wrong status written, missing auth, PII exposure, crash on common input). Style/duplication/naming is Medium/Low.`

// ---------------------------------------------------------------------------
phase('Survey')
log(`Reviewing /hq/:person_id/site-checkin — ${BATCHES.reduce((n, b) => n + b.files.length, 0)} files across ${BATCHES.length} groups`)

const survey = await agent(
  `Survey the architecture of the /hq/:person_id/site-checkin route in this Ember 5 app. Read app/routes/hq/site-checkin.js, app/routes/hq.js (the parent that loads the model), app/controllers/hq/site-checkin.js, and app/templates/hq/site-checkin.hbs in full. Skim the clubhouse-route / clubhouse-controller base classes and the house/session/toast/modal services they lean on.
Report (as concise prose an architect would put atop a review):
- The data-loading flow: what the PARENT hq.js model() hook fetches and how it awaits (serial vs parallel), what the leaf route's setupController seeds, and how the controller's @tracked state drives the wizard.
- The wizard / "mark on site" mutation path: how finishSiteCheckIn writes person.on_site and saves, and any stale-state or double-submit risks.
- Where permission/authorization is (or is not) enforced for editing another person's emergency contact / camp info and for the whole route (note hq.js beforeModel role gate vs the template-only canEditEmergencyContact gate).
- Cross-cutting conventions and inconsistencies (the contactSaved vs isContactSaved property mismatch, repeated radio/agreement messaging, save-with-toast boilerplate) that recur and could be centralized.
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
        `Adversarially verify this code-review finding about the /hq/:person_id/site-checkin route. Open the cited file (and any model/service/base-class/sibling it depends on) and try to REFUTE it. A finding is NOT real if it mistakes an Ember/Glimmer/Ember-Data idiom for a bug, cites a line that does not say what is claimed, assumes behavior the surrounding code or parent route already guards (e.g. role checks in hq.js beforeModel), or is pure opinion dressed as a defect.\n\nFINDING:\nfile: ${f.file}\nlocation: ${f.location}\nseverity: ${f.severity}\ncategory: ${f.category}\nproblem: ${f.problem}\nproposed fix: ${f.fix}\n\nReturn your verdict.`,
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
  `You are the lead Software Architect writing the final review of the /hq/:person_id/site-checkin route in this Ember 5 app. Be harsh, specific, and actionable.

SURVEY:
${survey}

VERIFIED FINDINGS (already adversarially checked; refuted ones removed):
${findingsTable}

Write a Markdown report with these sections:
# /hq/:person_id/site-checkin — Software Architecture Review
## Executive Summary — overall health verdict, top 3 systemic problems, and a maintainability/readability grade (A–F) with justification.
## Findings by Severity — group the findings above under Critical / High / Medium / Low. For each: file:location, what's wrong, how to fix. Merge findings that recur across files into a single "systemic" entry naming all affected files.
## DRY / KISS Assessment — the biggest duplication and over-complexity patterns (radio/agreement messaging, save-with-toast, wizard nesting), with the concrete shared helper/service/getter API you'd extract (function signatures).
## File-Split Recommendations — which files are doing too much (esp. the .hbs wizard) and how to decompose them into sub-components.
## Refactored Example — pick the single file with the worst combination of issues from the findings (likely the controller or the template), and provide a COMPLETE refactored version in a fenced code block that fixes the issues while preserving identical functionality. Above it, state which file and why. If you extract a shared helper/getter, show it too (fenced), and a 2-3 line note of how the refactored file now uses it.
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
