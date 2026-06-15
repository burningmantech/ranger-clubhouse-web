export const meta = {
  name: 'potentials-filters-redesign',
  description: 'Restyle /mentor/potentials filters into the DESIGN-SKILLS roster-controls bar pattern',
  phases: [
    { title: 'Plan', detail: 'Read the roster-controls pattern + current potentials filter, produce an exact edit plan' },
    { title: 'Implement', detail: 'Apply the controls-bar markup, controller, and SCSS edits' },
    { title: 'Verify', detail: 'Lint/build + design-conformance review in parallel' },
  ],
}

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reuseExistingScss', 'newMarkup', 'controllerChanges', 'scssChanges', 'notes'],
  properties: {
    reuseExistingScss: {
      type: 'boolean',
      description: 'True if .roster-controls/.roster-controls-divider/.roster-controls-count/.roster-info-note are already globally available (e.g. tables.scss imported) and can be reused as-is on the potentials page.',
    },
    newMarkup: {
      type: 'string',
      description: 'The exact replacement Handlebars block for the filter region of app/templates/mentor/potentials.hbs — the tinted .roster-controls bar wrapping the Filter By label + the six checkbox toggles, dividers, and the .roster-controls-count pill showing the "Showing X of Y" count. Keep all six existing @checked bindings (untrained, rrnFlagged, vcFlagged, trainingFlagged, mentorFlagged, personnelFlagged).',
    },
    controllerChanges: {
      type: 'string',
      description: 'Any required edits to app/controllers/mentor/potentials.js (e.g. a getter for the count pill / pluralized labels). "none" if no controller change is needed.',
    },
    scssChanges: {
      type: 'string',
      description: 'Any SCSS to add (file + selector). Prefer reusing the existing roster-controls classes. Only add new rules for genuinely potentials-specific needs (e.g. checkbox spacing inside the bar). "none" if no SCSS change needed.',
    },
    notes: { type: 'string', description: 'Risks, ambiguities, or decisions the implementer must honor.' },
  },
}

const IMPL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['filesChanged', 'summary'],
  properties: {
    filesChanged: { type: 'array', items: { type: 'string' }, description: 'Absolute paths of every file edited.' },
    summary: { type: 'string', description: 'What changed and how it maps to the plan.' },
  },
}

const LINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['passed', 'output'],
  properties: {
    passed: { type: 'boolean' },
    output: { type: 'string', description: 'Relevant lint errors/warnings, or confirmation of a clean run.' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['conforms', 'issues'],
  properties: {
    conforms: { type: 'boolean', description: 'True if the implemented filter bar faithfully matches the DESIGN-SKILLS roster-controls pattern.' },
    issues: {
      type: 'array',
      items: { type: 'string' },
      description: 'Concrete deviations from the documented pattern (missing class, wrong token, count pill absent, etc). Empty if fully conformant.',
    },
  },
}

phase('Plan')
const plan = await agent(
  `You are planning a focused UI restyle of the FILTER region of the /mentor/potentials page so it matches the "Roster Filter / Controls Bar" pattern documented in DESIGN-SKILLS.md.

READ these files first:
- DESIGN-SKILLS.md (focus on the "Roster Filter / Controls Bar" section, ~lines 158-299: anatomy, markup, styles, tokens)
- app/templates/ops/teams/manage.hbs (the live roster-controls markup, ~line 30)
- app/styles/tables.scss (the .roster-controls / -count / -divider / .roster-info-note rules, ~lines 219-255) — confirm whether tables.scss is imported globally so these classes are already available on the potentials page
- app/templates/mentor/potentials.hbs (CURRENT state: a "Filter By:" FormRow with six inline Bootstrap checkboxes at lines 3-31, then prose paragraphs and a "Showing X of Y" count at line 48)
- app/controllers/mentor/potentials.js (the six @tracked filter flags, filteredPeople, filterNames, personnelIssuesCount)

GOAL: Convert the bare "Filter By:" checkbox FormRow into the tinted .roster-controls bar visual language:
- Wrap the filter label + the six checkbox toggles inside <div class="roster-controls">
- Use a <span class="fw-semibold small"> for the "Filter By:" label group (matching the roster "View:" label treatment)
- Insert <div class="roster-controls-divider"></div> rules to separate the label group, the checkbox group, and the count
- Move/render the "Showing {{this.filteredPeople.length}} of ..." count as a <span class="roster-controls-count"> pill inside the bar
- Keep the page's six independent boolean checkbox filters (do NOT replace them with a single select — the roster's View select is a single-choice control, but potentials uses independent toggles; adapt the visual shell, keep the multi-toggle behavior and all @checked bindings intact)
- Convert the explanatory legend/prose paragraphs into the muted .roster-info-note treatment where it reads cleanly (the "Legend:" line and the sorted worst-first note are good candidates)

Constraints: reuse existing global SCSS classes wherever possible; only propose NEW scss for genuinely potentials-specific spacing. Do not change any filtering logic. Output an exact, paste-ready Handlebars block for the new filter region.`,
  { schema: PLAN_SCHEMA, phase: 'Plan' }
)

log(`Plan ready — reuse existing scss: ${plan.reuseExistingScss}`)

phase('Implement')
const impl = await agent(
  `Implement this filter restyle for /mentor/potentials EXACTLY per the plan below. Edit the working tree directly.

PLAN:
- New filter-region markup for app/templates/mentor/potentials.hbs:
${plan.newMarkup}

- Controller changes (app/controllers/mentor/potentials.js):
${plan.controllerChanges}

- SCSS changes:
${plan.scssChanges}

- Notes to honor:
${plan.notes}

Apply by reading each target file then using Edit. Replace the current "Filter By:" FormRow (lines ~3-31 of app/templates/mentor/potentials.hbs) and integrate the count pill; preserve the empty-state {{#if this.filteredPeople.length}} block and the <UnifiedFlagging> render below it. Do NOT alter filtering logic or the six @tracked flags' semantics. After editing, report every file path you changed and a short summary.`,
  { schema: IMPL_SCHEMA, phase: 'Implement' }
)

log(`Edited: ${impl.filesChanged.join(', ')}`)

phase('Verify')
const [lint, review] = await parallel([
  () => agent(
    `Run the Handlebars, JS, and CSS linters for this Ember project and report results. Run: \`npm run lint:hbs\`, \`npm run lint:js\`, and \`npm run lint:css\` (each may take a while). Focus your report on app/templates/mentor/potentials.hbs, app/controllers/mentor/potentials.js, and any SCSS file touched: ${impl.filesChanged.join(', ')}. Report whether lint passed and quote any errors tied to the changed files.`,
    { schema: LINT_SCHEMA, phase: 'Verify', label: 'lint' }
  ),
  () => agent(
    `Adversarially review whether the implemented /mentor/potentials filter bar faithfully matches the "Roster Filter / Controls Bar" pattern in DESIGN-SKILLS.md.

Read DESIGN-SKILLS.md (Roster Filter / Controls Bar section) and the CURRENT app/templates/mentor/potentials.hbs after the edits (plus any SCSS touched: ${impl.filesChanged.join(', ')}).

Check specifically: (1) the filter region is wrapped in <div class="roster-controls">; (2) the label uses the fw-semibold small treatment; (3) roster-controls-divider rules separate the groups; (4) the count is rendered as a roster-controls-count pill; (5) all six checkbox @checked bindings (untrained, personnelFlagged, rrnFlagged, vcFlagged, trainingFlagged, mentorFlagged) are still present and wired; (6) filtering logic is unchanged; (7) any explanatory prose uses the roster-info-note treatment where appropriate. List concrete deviations.`,
    { schema: REVIEW_SCHEMA, phase: 'Verify', label: 'design-review' }
  ),
])

return {
  filesChanged: impl.filesChanged,
  implementationSummary: impl.summary,
  lint: lint ?? { passed: false, output: 'lint agent did not return' },
  designReview: review ?? { conforms: false, issues: ['design-review agent did not return'] },
}
