export const meta = {
  name: 'hq-site-checkin-implement-fixes',
  description: 'Implement all findings from the /hq/:person_id/site-checkin architecture review: create a shared save-model service, then fix the two disjoint file-groups (parent data-loader route; site-checkin route+controller+template+new components) in parallel, then stabilize via lint+build',
  whenToUse: 'After running hq-site-checkin-architect-review, to apply the recommended fixes. Edits the working tree — run on a dedicated branch.',
  phases: [
    { title: 'Foundation', detail: 'Create the shared save-model service consumed by the site-checkin controller' },
    { title: 'Implement', detail: 'Two disjoint agents: parent route (hq.js) and the site-checkin trio + new components' },
    { title: 'Stabilize', detail: 'lint:fix, lint, ember build; fix any errors introduced' },
    { title: 'Report', detail: 'Summarize changes, deferrals, and verification status' },
  ],
}

// The full review lives here for any agent that wants complete context.
const REVIEW_DOC = 'HQ-SITE-CHECKIN-ARCHITECT-REVIEW.md'
const BRANCH = 'hq-site-checkin-architect-fixes'

// ---- Cross-group contracts pinned so disjoint agents agree without racing ----
const SAVE_MODEL_CONTRACT = `Shared service \`app/services/save-model.js\` (injected as \`@service saveModel\`). It MUST expose exactly:
  • async save({ model, message, owner })
      - injects @service toast and @service house
      - if (owner.isSubmitting) return false;            // central double-submit guard
      - owner.isSubmitting = true;
      - this.toast.clear();
      - try { await model.save(); if (message) this.toast.success(message); return true; }
      - catch (response) { this.house.handleErrorResponse(response); model.rollbackAttributes(); return false; }
      - finally { owner.isSubmitting = false; }
  Returns true on success, false on failure OR if a save is already in flight. \`owner\` is the controller/component that exposes a tracked \`isSubmitting\` field.
The implementing agent MUST read app/controllers/hq/site-checkin.js (its current \`_savePerson\`) and grep app/services for the existing \`toast\`/\`house\` idioms (e.g. how other services inject and call house.handleErrorResponse / toast.success / toast.clear) to match them EXACTLY, so the service is a drop-in that preserves today's behavior.`

const MODEL_SHAPE_CONTRACT = `MODEL-SHAPE CONTRACT (both implement agents must honor): after the parent route refactor, app/routes/hq.js model() MUST still return the SAME keys the HQ pages consume — person, personEvent, personBanners, eventInfo, positions, unread_message_count, assets, attachments, timesheetSummary, photo, and (when applicable) onduty — and setupController MUST still attach \`model.eventPeriods\` as an object { pre:{current,hasPass?}, event:{...}, post:{...} }. The leaf site-checkin route depends specifically on: person, personEvent, eventInfo, assets, attachments, eventPeriods. Do NOT rename, drop, or change the meaning of these keys. hq.js is the SHARED parent of the shift and timesheet sub-routes too, so any change must preserve behavior for them.`

const RADIO_STATUS_CONTRACT = `If you extract the duplicated radio/agreement messaging, the NEW shared component is \`app/components/hq/radio-authorization-status.{js,hbs}\`, invoked as \`<Hq::RadioAuthorizationStatus @personEvent={{...}} @eventInfo={{...}} @variant="agreement|summary|wizard" />\`. It must render byte-equivalent markup to the block it replaces for each variant. Only the core group creates and consumes it.`

const GLOBAL_RULES = `GROUND RULES (apply to every change):
- PRESERVE FUNCTIONALITY EXACTLY. These are refactors + bug fixes, not feature changes. Rendered output, network calls, and user-visible behavior must be identical EXCEPT where a finding explicitly fixes a bug (e.g. a null-guard that prevents a crash, a corrected typo/icon).
- Follow project conventions (CLAUDE.md): CSS dash-case, form/API fields snake_case, vars/methods camelCase, numeric/string constants UPPER_SNAKE_CASE, Array/object constants Capitalized, classes Capitalized. Glimmer + Octane: every field read in a template must be @tracked; plain imperative flags read only in JS are explicit non-tracked fields with sensible defaults.
- ONLY edit the files assigned to you (listed below) plus the NEW files you are told to create. Do NOT touch files owned by the other group — cross-file coordination is handled via the pinned contracts.
- If a change cannot be made safely without breaking functionality or editing files you don't own, SKIP it and record it under "DEFERRED:" with the precise reason. Correctness over completeness.
- Read every file you own IN FULL before editing. Read ${REVIEW_DOC} for the complete finding text and the reference "Refactored Example" if you need more detail than the task list below.`

// ---- Disjoint file-group work units. Each agent owns its files exclusively. ----
const GROUPS = [
  {
    key: 'parent-route',
    label: 'hq.js parent data-loader',
    files: ['app/routes/hq.js'],
    creates: [],
    usesSaveModel: false,
    tasks: `Fix these in app/routes/hq.js (the SHARED parent route — preserve behavior for the shift & timesheet sub-routes):
- PERF (High) model() lines ~31-51: every property in the \`requests\` object literal is individually \`await\`ed inline, so all ~11 person-scoped requests run SERIALLY. Convert to a parallel resolve: \`import { hash } from 'rsvp';\` and build the object of UN-awaited promises, then \`return hash({...})\`. The conditional \`onduty\` (lines 53-56) must be folded in deterministically — always resolve a value (e.g. include \`onduty: this.session.user?.onduty_position ? Promise.resolve(undefined) : this.session.updateOnDuty()\` or compute it before the hash). Keep the EXACT same keys and post-resolution shape per the MODEL-SHAPE CONTRACT. Verify each request expression is reproduced verbatim — only the await/hash wrapping changes.
- BUG (crash) setupController line ~84: \`eventPeriods[model.eventInfo.event_period].current = true\` throws if event_period is null/missing/unknown → guard: \`const period = model.eventInfo?.event_period; if (period && eventPeriods[period]) { eventPeriods[period].current = true; }\`.
- BUG setupController lines ~53/65: guard \`this.session.user?.onduty_position\` and the \`person.set('unread_message_count', ...)\`. For the unread count: prefer carrying it as a controller field (\`controller.set('unreadMessageCount', model.unread_message_count)\`) rather than mutating the person record — BUT first grep the templates/components for \`unread_message_count\` reads on the person record; if any consumer reads \`person.unread_message_count\`, KEEP the current behavior and DEFER this one with a note (do not break those consumers).
- BUG setupController: \`model.eventPeriods\` is assigned (lines ~77-92) AFTER \`controller.setProperties(model)\` (line ~66), so the controller's copy diverges. Build eventPeriods BEFORE setProperties, or add \`controller.set('eventPeriods', eventPeriods)\` after building it. Keep the same final structure.
- EDGECASE updateTimesheetSummaries (lines ~95-102): \`this.controller.set(...)\` may run after teardown → early-return \`if (this.isDestroying || this.isDestroyed || !this.controller) return;\` and keep the existing catch.
- LOW model() lines ~28-29 \`unloadAll('timesheet')\` / \`unloadAll('asset-person')\`: the \`timesheet\` unload looks like a copy-paste leftover, but hq.js is the parent of the timesheet sub-route — grep app/routes/hq/timesheet.js before touching it. Add a brief comment explaining the rationale; only remove the \`timesheet\` unload if you confirm no hq sub-route relies on it, else DEFER with a note.
- LOW document the person-event composite id convention with a one-line comment at line ~33 (\`\${person_id}-\${year}\`); optionally compute \`currentYear()\` once and reuse.
${MODEL_SHAPE_CONTRACT}`,
  },
  {
    key: 'core',
    label: 'site-checkin route + controller + template + new components',
    files: [
      'app/routes/hq/site-checkin.js',
      'app/controllers/hq/site-checkin.js',
      'app/templates/hq/site-checkin.hbs',
    ],
    creates: [
      'app/components/hq/radio-authorization-status.js',
      'app/components/hq/radio-authorization-status.hbs',
      // Optional wizard step-component split — create ONLY if behavior stays identical, else defer:
      'app/components/hq/site-checkin/contact-step.{js,hbs} (optional split)',
      'app/components/hq/site-checkin/radio-step.{js,hbs} (optional split)',
      'app/components/hq/site-checkin/finish-step.{js,hbs} (optional split)',
    ],
    usesSaveModel: true,
    tasks: `Apply the review's findings + "Refactored Example" (in ${REVIEW_DOC}) across the leaf route, controller, and template. The review provides a near-complete refactored controller — follow it, but re-read each current file and preserve behavior exactly.

CONTROLLER app/controllers/hq/site-checkin.js:
- Migrate saves to \`@service saveModel\`: replace \`_savePerson\` with calls to \`this.saveModel.save({ model, message, owner: this })\`. DELETE the old \`_savePerson\`. Scope the on_site flip and the contact save as SEPARATE save calls so a failed on_site save can no longer rollback unrelated contact edits.
- \`saveContactForm(model, callback)\`: call saveModel.save(...) and only invoke \`callback?.()\` when it returns true.
- \`finishSiteCheckIn\`: set \`this.person.on_site = true\`, await saveModel.save(...), and only run the success side-effects (isOnSite/showSiteCheckInWizard/siteCheckInFinished/siteCheckInStarted) when it returns true.
- \`startSiteCheckIn\`: early-return \`if (this.isSubmitting || this.isOnSite) return;\` before opening the wizard.
- Null-safety: \`activeAssets\` → \`(this.assets ?? []).filter(...)\`; \`allowedEventRadio\` → \`Boolean(this.eventInfo?.radio_eligible && this.personEvent?.asset_authorized && (this.eventInfo?.radio_max ?? 0) > 0)\` (also fixes the missing semicolon + redundant parens); \`checkForRadio\` uses the guarded getters.
- Remove the dead/mismatched \`@tracked isContactSaved\` (it is never read by controller or template) OR wire it to a consumer — prefer removal. Add \`get isAlphaOrProspective() { return Boolean(this.person?.isAlpha || this.person?.isProspective); }\`.
- Add \`resetState(person)\` that sets isSubmitting=false, isOnSite=person?.on_site ?? false, showSiteCheckInWizard=false, siteCheckInStarted=false, siteCheckInFinished=false (single owner for per-entry reset; the route will call it).
- Fix the typo in checkForRadio copy: "no radios **where** checked out" → "were"; lift the long modal title/body strings to module constants (e.g. NO_RADIO_CHECKED_OUT_TITLE / a NO_RADIO_CHECKED_OUT_BODY(callsign) builder).
${SAVE_MODEL_CONTRACT}

LEAF ROUTE app/routes/hq/site-checkin.js:
- Call \`super.setupController(controller, model);\` first.
- Replace \`controller.setProperties(model)\` with an explicit allow-list: \`controller.setProperties({ person, personEvent, eventInfo, assets, attachments, eventPeriods });\` (destructure from model).
- Replace the field-by-field state pokes with \`controller.resetState(model.person);\` then set \`controller.canEditEmergencyContact = ...\` (keep the existing isAdmin || isEMOPEnabled || hasRole(EDIT_EMERGENCY_CONTACT) expression). Remove the bogus \`controller.contactSaved = false\` (property does not exist). Note: extracting a \`session.canEditEmergencyContact\` getter would require editing the session service which you do NOT own — keep the expression inline here and DEFER that extraction with a note.

TEMPLATE app/templates/hq/site-checkin.hbs:
- Fix user-facing defects: line ~188 title "On-Site Registration **In** Not Completed" → "On-Site Registration Not Completed"; line ~188 \`@icon="band"\` → \`@icon="ban"\`; line ~189 copy "Begin Site Registration" → "Begin On-Site Registration" (match the real button label at line ~77).
- Use \`{{#if (or this.person.isAlpha this.person.isProspective)}}\` → replace BOTH occurrences (lines ~125 and ~169) with \`{{this.isAlphaOrProspective}}\` from the controller getter.
- Disable wizard finish/next while saving: bind the relevant \`@disabled={{this.isSubmitting}}\` so a double-click can't double-submit (coordinate with the controller's isSubmitting).
- DRY: extract the triplicated radio/agreement messaging (lines ~15-27 Agreements, ~48-65 Provisions Summary, ~125-166 wizard Radios) into \`<Hq::RadioAuthorizationStatus>\` and reuse it. ${RADIO_STATUS_CONTRACT} Produce byte-equivalent output per variant; if a block differs too much to unify safely, unify only the ones that are truly identical and DEFER the rest with a note.
- Gate the Provisions Summary (lines ~48-65) on \`eventInfo.radio_info_available\` like the wizard does, and distinguish \`radio_max\` null/undefined from a deliberate 0 (don't render "Shift Radios only" when data is merely missing). If this risks changing output for the common (data-present) case, keep it minimal and note any deferral.
- Replace hard-coded \`@cols={{80}}\` on the textareas (lines ~96, ~114) with responsive \`w-100\` per project convention.
- OPTIONAL FILE SPLIT: the \`<UiWizard>\` (lines ~80-186) mixes contact, radio, and finish concerns. Extract ContactStep / RadioStep / FinishStep sub-components under app/components/hq/site-checkin/ ONLY if you can keep behavior + rendered output identical; otherwise DEFER with a note (this is a nice-to-have, not a correctness fix).`,
  },
]

// ---------------------------------------------------------------------------
phase('Foundation')
log(`Implementing /hq/:person_id/site-checkin review findings across ${GROUPS.length} disjoint groups on branch ${BRANCH}`)

const foundation = await agent(
  `${GLOBAL_RULES}

You are creating ONE new shared file and nothing else: \`app/services/save-model.js\`.

${SAVE_MODEL_CONTRACT}

Read app/controllers/hq/site-checkin.js (current \`_savePerson\`) and grep app/services for an existing service that injects \`house\` and \`toast\` to copy the EXACT idioms (import paths, how house.handleErrorResponse is called, toast.success/clear). Then write app/services/save-model.js. Do not modify any other file. Return a short description of the final public API (method signature + success/failure/guard semantics) so the consumer agent can rely on it.`,
  { label: 'foundation:save-model', phase: 'Foundation' }
)

// ---------------------------------------------------------------------------
phase('Implement')
// Disjoint file ownership (hq.js vs the site-checkin trio + new files) → run concurrently.
const results = await parallel(GROUPS.map((g) => () =>
  agent(
    `${GLOBAL_RULES}

${g.usesSaveModel ? `A shared service is already created. Its API:\n${foundation}\n\nUse it via \`import { inject as service } from '@ember/service';\` and \`@service saveModel;\`. ${SAVE_MODEL_CONTRACT}\n` : ''}You OWN exactly these files (edit only these${g.creates.length ? ', plus create the NEW files listed' : ''}):
OWNED: ${g.files.join(', ')}
${g.creates.length ? 'CREATE: ' + g.creates.join(', ') : ''}

TASKS:
${g.tasks}

When done, verify your edits are internally consistent (no references to symbols you removed, imports cleaned up, every template-read field is @tracked or a getter). Return prose: (1) a bullet list of changes per file, (2) a "DEFERRED:" section listing any finding you intentionally skipped and exactly why.`,
    { label: `impl:${g.key}`, phase: 'Implement' }
  ).then((summary) => ({ group: g.key, label: g.label, summary }))
))

const done = results.filter(Boolean)
log(`Implementation complete: ${done.length}/${GROUPS.length} groups finished`)

// ---------------------------------------------------------------------------
phase('Stabilize')
const stabilize = await agent(
  `You are stabilizing the working tree after a multi-file refactor of the /hq/:person_id/site-checkin route on branch ${BRANCH}.

Run, in order, and FIX what you can:
1. \`npm run lint:fix\` then \`npm run lint:js\` and \`npm run lint:hbs\` — fix every lint error introduced by the refactor (unused imports, undeclared vars, template syntax). Re-run until clean or only pre-existing warnings remain.
2. \`npx ember build\` (or \`npm run build\`) — it MUST compile. Fix any build/template-resolution errors. New files this run: app/services/save-model.js, app/components/hq/radio-authorization-status.{js,hbs}, and possibly app/components/hq/site-checkin/{contact,radio,finish}-step.{js,hbs} — make sure every \`<Hq::...>\` invocation resolves to a real component file and every \`@service saveModel\` resolves.
3. If quick, \`npx ember test --filter="site-checkin"\` — report pass/fail; do NOT block on a hanging/slow full suite.

Constraints: edit any file, but ONLY to fix errors introduced by the refactor — do not revert intended fixes or add features. If a fix would require reverting a finding's change, prefer the minimal adjustment that keeps both the fix and a green build.

Return: final lint status, final build status (pass/fail + remaining errors verbatim), test result if run, and the list of files you touched to stabilize.`,
  { label: 'stabilize', phase: 'Stabilize' }
)

// ---------------------------------------------------------------------------
phase('Report')
const report = await agent(
  `Write the final implementation report (Markdown) for applying the /hq/:person_id/site-checkin architecture-review findings on branch ${BRANCH}. Be concise and factual — do not pad.

FOUNDATION (shared service created):
${foundation}

PER-GROUP CHANGE SUMMARIES:
${done.map((r) => `### ${r.group} (${r.label})\n${r.summary}`).join('\n\n')}

STABILIZATION RESULT:
${stabilize}

Produce:
# /hq/:person_id/site-checkin — Fixes Implemented
## Summary — one paragraph: what landed, build/lint status.
## New Shared Modules — save-model service, radio-authorization-status component, and any wizard step components — one line each.
## Changes by File — group the per-file bullets above.
## Deferred / Not Applied — consolidate every DEFERRED item from the groups, each with its reason, so the user knows exactly what was NOT done and why.
## Verification — lint + build (+ test) status, and a recommended next step (run full \`npm test\`, manual smoke of the HQ On-Site Registration page).
Output only the Markdown.`,
  { label: 'report', phase: 'Report' }
)

return {
  reportMarkdown: report,
  branch: BRANCH,
  groupsImplemented: done.length,
  stabilization: stabilize,
}
