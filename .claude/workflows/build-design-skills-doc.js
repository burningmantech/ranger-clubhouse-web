export const meta = {
  name: 'build-design-skills-doc',
  description: 'Construct a UX/UI design-skills document for a handful of Clubhouse design elements: the roster Legend and Filter/Controls bar (/ops/teams/:id) and the unified-flagging note presentation — section partitioning + accordion rows (/mentor/potentials).',
  phases: [
    { title: 'Inspect', detail: 'One agent per design element — read the real template/component/SCSS + the captured screenshot, emit a structured spec.' },
    { title: 'Author', detail: 'Synthesize the specs into DESIGN-SKILLS.md.' },
  ],
}

const ROOT = '/Users/lion/rangers/src/clubhouse2/web'
const SHOTS = `${ROOT}/proofshot-artifacts`

// JSON Schema each inspector returns. Snippets must be copied VERBATIM from the
// real files (not paraphrased) so the doc teaches the actual house style.
const SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'slug', 'page', 'purpose', 'whenToUse', 'anatomy', 'markup', 'styles', 'designTokens', 'behavior', 'accessibility', 'gotchas', 'sourceRefs'],
  properties: {
    name: { type: 'string', description: 'Human title of the design element, e.g. "Roster Legend".' },
    slug: { type: 'string', description: 'kebab-case anchor slug.' },
    page: { type: 'string', description: 'Where it lives, e.g. "/ops/teams/:id (Team Roster)".' },
    purpose: { type: 'string', description: '1-2 sentences: the design problem this element solves.' },
    whenToUse: { type: 'string', description: 'When a future builder should reach for this pattern.' },
    anatomy: { type: 'array', items: { type: 'string' }, description: 'Ordered structural parts (container -> children), each a short phrase with its CSS class.' },
    markup: { type: 'string', description: 'Representative Handlebars snippet copied verbatim from the source template/component.' },
    styles: { type: 'string', description: 'The governing SCSS rules copied verbatim (classes that define the look).' },
    designTokens: { type: 'array', items: { type: 'string' }, description: 'Concrete values that define the look: hex colors, paddings, radii, font-sizes, border treatments — each with what it applies to.' },
    behavior: { type: 'string', description: 'Interaction + the controlling JS logic (filter state, grouping rules, expand/collapse, severity mapping).' },
    accessibility: { type: 'string', description: 'A11y treatment present or recommended (aria-expanded, titles, semantics, contrast).' },
    gotchas: { type: 'array', items: { type: 'string' }, description: 'Non-obvious constraints / pitfalls a re-implementer must respect (e.g. align-self centering, !important overrides, non-atomic POSTs).' },
    sourceRefs: { type: 'array', items: { type: 'string' }, description: 'file:line references backing this spec.' },
  },
}

const ELEMENTS = [
  {
    label: 'legend',
    name: 'Roster Legend',
    prompt: `Produce a structured design spec for the **Roster Legend** band on the Team Roster page (/ops/teams/:id).

Read these sources (use Read; copy snippets VERBATIM, do not paraphrase):
- Template: ${ROOT}/app/templates/ops/teams/manage.hbs  (the legend block, lines ~6-28)
- SCSS: ${ROOT}/app/styles/tables.scss  (rules .roster-legend, .roster-legend-item, .roster-legend-label ~274-300; and the inline status glyph styles .roster-status-nw, .roster-status-never-worked ~104-116)
- Screenshot for visual reference: ${SHOTS}/teams-10.png  (Read it as an image)

Capture: the flex layout, the left accent border + tinted background card treatment, the uppercase letterspaced "LEGEND:" label, how each legend item pairs a glyph/icon with its meaning, and the exact color tokens. Note it is a static documentation band (no interaction).`,
  },
  {
    label: 'filter-bar',
    name: 'Roster Filter / Controls Bar',
    prompt: `Produce a structured design spec for the **Filter / Controls Bar** on the Team Roster page (/ops/teams/:id).

Read these sources (copy snippets VERBATIM):
- Template: ${ROOT}/app/templates/ops/teams/manage.hbs  (the ".roster-controls" block ~30-50, plus the ".roster-info-note" line ~52-55)
- Controller: ${ROOT}/app/controllers/ops/teams/manage.js  (the VIEW_FILTER constant, viewFilterOptions, @tracked viewFilter, the @cached viewPeople switch, selectAll/deselectAll, selectedPeople, and how revokeSelected is gated)
- SCSS: ${ROOT}/app/styles/tables.scss  (.roster-controls, .roster-controls-count, .roster-controls-divider ~245-272; .roster-info-note ~314-319)
- Screenshot: ${SHOTS}/teams-10.png

Capture: the single horizontal flex bar (label + ChForm::Select view filter, vertical divider, live count pill, select-all / deselect-all links, divider, danger Revoke button disabled until a selection exists), the tinted bar background + border + radius, the count "pill" treatment, the divider element, and the controller-side single-source-of-truth filter keys. Explain how the View select drives viewPeople and how the count and Revoke button stay in sync with the current filter + selection.`,
  },
  {
    label: 'section-partitioning',
    name: 'Triage Section Partitioning',
    prompt: `Produce a structured design spec for the **Section Partitioning** of the Potential Alphas list (/mentor/potentials) — the titled groups that split the list into "Rank 3/4 or Prior Mentor Bonk" (priority) vs "Other Potential Alphas".

Read these sources (copy snippets VERBATIM):
- Template: ${ROOT}/app/templates/mentor/potentials.hbs  (the two ".uf-row-section" blocks ~50-71, each wrapping a ".uf-row-stack" of <PotentialAlphaRow>)
- Controller: ${ROOT}/app/controllers/mentor/potentials.js  (sortedPotentials worst-first sort, isPriority rule, priorityPotentials, otherPotentials, and the worst-first vs alphabetical ordering difference between the two groups)
- Utility: ${ROOT}/app/utils/intake-summaries.js  (severityWeight, worstRank, mentorBonkYear, severitySlug — whatever the controller imports)
- SCSS: ${ROOT}/app/styles/app.scss  (.uf-row-section, .uf-row-section-title ~795-808; .uf-row-stack ~679-681)
- Screenshot: ${SHOTS}/potentials.png

Capture: the "scan-first / worst-first" philosophy (concerning people cluster at the top), the titled section header treatment (1.3rem semibold with a light bottom border), the membership rule that decides priority vs other, and the deliberate ordering difference (priority = severity-weighted; other = plain alphabetical).`,
  },
  {
    label: 'accordion-row',
    name: 'Dense-Triage Accordion Row + Note Partitioning',
    prompt: `Produce a structured design spec for the **Dense-Triage Accordion Row** used per person on /mentor/potentials (the <PotentialAlphaRow>), including its collapsed anchor line and the expanded team-partitioned note detail.

Read these sources (copy snippets VERBATIM):
- Component template: ${ROOT}/app/components/potential-alpha-row.hbs  (full — the severity-striped .uf-row, the .uf-row-anchor collapsed line with toggle button, identity, training/mentor-bonk badges, IntakeRankStrip, notes-present dots, and the {{#if this.expanded}} .uf-row-detail with the .uf-card-teams partition of Personnel / RRN / VC / Training / Mentor)
- Component JS: ${ROOT}/app/components/potential-alpha-row.js  (severityClass, expanded/toggle, noteBadges rules, trainingStatus, mentorBonk, NOTE_STREAMS, RANK_BADGE_TYPE)
- Note sub-components: ${ROOT}/app/components/intake-notes.hbs, ${ROOT}/app/components/intake-notes.js, ${ROOT}/app/components/intake-training.hbs, ${ROOT}/app/components/intake-rank-strip.js
- SCSS (copy the key rules): ${ROOT}/app/styles/app.scss  — the uf-row family ~683-819 (.uf-row, severity variants .uf-row-flag/-yellow/-green/-normal, .uf-row-anchor, .uf-row-toggle, .uf-row-identity, .uf-row-dots, .uf-row-badge, .uf-row-badge-training, .uf-row-detail), the team partition ~597-614 (.uf-card-teams, .uf-team, .uf-team-label), the full-bleed banner ~554-567 + ~710-712 (.uf-flag-banner), and the rank chips ~616-673 (.intake-rank-chip + rank-1..4 color variants)
- Screenshot of an EXPANDED row: ${SHOTS}/potentials-expanded.png

Capture: the left severity stripe (6px border-left color-keyed to worst rank / Personnel flag), the collapsed one-line anchor that optically centers heterogeneous children (note the align-self:center + line-height normalization gotcha and the .mb-3 override on the rank strip), the notes-present "dots" badge digest and the rules for which badges show (rank-2 omitted, rank-4 Personnel omitted because the banner conveys it), the full-bleed red Personnel banner, the expand/collapse toggle (aria-expanded, chevron), and the expanded .uf-card-teams partition where each stream (Personnel/RRN/VC/Training/Mentor) is a labeled .uf-team block with notes + Add Note/Rank. Include the rank chip color tokens (rank 1 green / 2 grey / 3 yellow / 4 red).`,
  },
]

phase('Inspect')
log(`Inspecting ${ELEMENTS.length} design elements from source + screenshots`)

const specs = await parallel(
  ELEMENTS.map((el) => () =>
    agent(el.prompt, { label: `inspect:${el.label}`, phase: 'Inspect', schema: SPEC_SCHEMA })
  )
)

const ok = specs.filter(Boolean)
log(`Captured ${ok.length}/${ELEMENTS.length} specs`)

phase('Author')

const docPath = `${ROOT}/DESIGN-SKILLS.md`
const authorPrompt = `You are writing a focused UX/UI **design-skills** reference document for the Clubhouse 2.0 Ember app. Match the tone and structure of the existing ${ROOT}/AGENT-SKILLS.md and ${ROOT}/DESIGN-GUIDELINES.md (read their first ~40 lines to match the house voice and heading style).

Write the document to: ${docPath}  (overwrite if present) using the Write tool.

The document covers ONLY these ${ok.length} design elements (this is a deliberately small, curated set — do not invent others). Here are the verified structured specs (JSON), each copied from the real source:

${JSON.stringify(ok, null, 2)}

Requirements for the document:
- Title: "# Clubhouse 2.0 Design Skills" with a 1-2 sentence intro explaining it documents reusable, scan-first UI patterns drawn from the Team Roster and Potential Alphas pages.
- A "## Table of Contents" linking to each element's section by its slug anchor.
- Group the two roster elements under a "## Team Roster (/ops/teams/:id)" heading and the two potentials elements under a "## Unified Flagging — Potential Alphas (/mentor/potentials)" heading.
- For EACH element, a "### <name>" section with these subsections, in order: **Purpose**, **When to use**, **Anatomy** (bullet list), **Markup** (fenced \`handlebars\` block, verbatim from the spec), **Styles** (fenced \`scss\` block, verbatim), **Design tokens** (bullet list of the concrete values), **Behavior** (prose; include controlling JS where relevant), **Accessibility**, **Gotchas** (bullet list), and **Source** (the file:line refs as a bullet list with markdown links relative to the repo root, e.g. [app/.../x.hbs:6](app/.../x.hbs#L6)).
- Embed the captured screenshot under each relevant element as an illustrative image using a repo-relative link: ${SHOTS}/teams-10.png for both roster elements, ${SHOTS}/potentials.png for section partitioning, and ${SHOTS}/potentials-expanded.png for the accordion row. Use markdown image syntax with a caption-style alt text. Note in a small italic line that screenshots are illustrative captures.
- Close with a short "## Shared visual language" note tying together the recurring tokens (the rank color scale green/grey/yellow/red, the tinted-card-with-left-accent treatment, severity left-stripes, pill/badge sizing) so future work stays consistent.

Keep code blocks faithful to the specs — do NOT rewrite or "improve" the snippets. After writing the file, return ONLY: the absolute path written, the total line count, and the markdown Table of Contents you produced.`

const result = await agent(authorPrompt, { label: 'author:design-skills', phase: 'Author' })

return { docPath, inspected: ok.length, of: ELEMENTS.length, author: result }
