export const meta = {
  name: 'hq-shift-implement-fixes',
  description: 'Implement all findings from the /hq/:person_id/shift architecture review: create shared service, then fix every file-group in parallel (disjoint ownership), then stabilize via lint+build',
  whenToUse: 'After running hq-shift-architect-review, to apply the recommended fixes. Edits the working tree — run on a dedicated branch.',
  phases: [
    { title: 'Foundation', detail: 'Create the shared hq-action service consumed by 4 components' },
    { title: 'Implement', detail: 'One agent per disjoint file-group fixes all its findings + migrates to shared modules' },
    { title: 'Stabilize', detail: 'lint:fix, lint, ember build; fix any errors introduced' },
    { title: 'Report', detail: 'Summarize changes, deferrals, and verification status' },
  ],
}

// The full review lives here for any agent that wants complete context.
const REVIEW_DOC = 'HQ-SHIFT-ARCHITECT-REVIEW.md'

// ---- Cross-group contracts pinned so disjoint agents agree without racing ----
const HQ_ACTION_CONTRACT = `Shared service \`app/services/hq-action.js\` (injected as \`@service hqAction\`). It MUST expose:
  • async perform(url, body, { statusHandlers = {}, onSuccess, onError } = {})
      - injects @service house, ajax, toast
      - POSTs body to url via this.ajax.request(url, {method:'POST', data: body}) following the existing ajax usage in the repo
      - on success: looks up statusHandlers[result.status] and calls it(result); if no handler matches, shows toast error "Unknown status '\${result.status}' returned — please report to the Tech Ninjas." (the standardized fallback that today is re-typed in every component)
      - returns the parsed result; on failure calls (onError ?? this.house.handleErrorResponse)(e) and returns undefined
  • async saveWithRollback(record, { successMessage, onSuccess } = {})
      - try { await record.save(); if (successMessage) this.toast.success(successMessage); await onSuccess?.(record); return true }
      - catch (e) { record.rollbackAttributes(); this.house.handleErrorResponse(e); return false }
The implementing agent for the service must read 2-3 existing components (e.g. app/components/hq-pogs.js, app/components/hq-asset-table.js) to copy the EXACT ajax/toast/house idioms this project already uses, so the service is a drop-in for them. Preserve existing behavior exactly.`

const SELF_SERVE_CONTRACT = `The self-serve flag passed to <ShiftCheckInAlerts/> is canonically named \`@selfServe\` (NOT \`@isSelfServe\`). The parent template app/templates/hq/shift.hbs must pass \`@selfServe={{...}}\` and the component template app/components/shift-check-in-alerts.hbs must branch on \`{{#if @selfServe}}\`.`

const GLOBAL_RULES = `GROUND RULES (apply to every change):
- PRESERVE FUNCTIONALITY EXACTLY. These are refactors + bug fixes, not feature changes. The rendered output, network calls, and user-visible behavior must be identical except where a finding explicitly fixes a bug.
- Follow project conventions (CLAUDE.md): CSS dash-case, form/API fields snake_case, vars/methods camelCase, numeric/string constants UPPER_SNAKE_CASE, Array/object constants Capitalized, classes Capitalized. Glimmer + Octane: declare every field used in a template as @tracked; declare plain instance fields explicitly with sensible defaults.
- ONLY edit the files assigned to you (listed below) plus NEW files you are told to create. Do NOT touch files owned by other groups — cross-file coordination is handled via the pinned contracts.
- If a specific change cannot be made safely without breaking functionality (e.g. it would require editing files you don't own, or rippling through many template bindings), SKIP it and record it under "deferred" with the reason. Correctness over completeness.
- Read every file you own IN FULL before editing. Read ${REVIEW_DOC} for the complete finding text if you need more detail than the summary below.`

// ---- Disjoint file-group work units. Each agent owns its files exclusively. ----
const GROUPS = [
  {
    key: 'core',
    label: 'route+controller+template',
    files: [
      'app/routes/hq/shift.js',
      'app/controllers/hq/shift.js',
      'app/templates/hq/shift.hbs',
    ],
    creates: ['app/utils/radio-accounting.js'],
    usesHqAction: true,
    tasks: `Fix ALL of these in the route/controller/template:
- BUG controllers/hq/shift.js:342 \`pendingItems\` does \`return items++;\` (post-increment discards the add) → \`return items;\`.
- BUG controllers/hq/shift.js \`_findOnDuty\` uses \`off_duty == null\` while model getter \`isOffDuty\`/\`stillOnDuty\` uses \`!off_duty\`; they disagree on '' / 0. Make \`_findOnDuty\` use \`t.stillOnDuty\`.
- BUG controllers/hq/shift.js:266 \`endShiftNotify\` calls \`this.correctionCallback(timesheet)\` but it may be undefined → guard \`this.correctionCallback?.(timesheet)\` and declare \`correctionCallback = null;\` as an explicit field.
- Declare \`noShiftHandled\` and \`shiftTransition\` as explicit class fields (plain fields, NOT @tracked — they are imperative flags read only in JS, never in a template; verify that before deciding).
- BUG routes/hq/shift.js:21-22 \`routeWillChange\` calls \`transition.to.find(...)\` — guard \`transition.to\` (can be null on aborted transitions) the same way \`transition.from\` is guarded.
- routes/hq/shift.js: the \`routeWillChange\` listener is added in the constructor and never removed, so it fires app-wide forever and calls \`controllerFor\` on every transition. Move registration into \`activate()\` and tear it down in \`deactivate()\`.
- routes/hq/shift.js:75 \`setupTodo\` mutates a non-tracked array via \`.push()\` → reassign \`this.todos = [...]\` (or build the array then assign once). Ensure \`todos\` is @tracked on the controller.
- routes/hq/shift.js reaches into controller private methods to build todos. Expose a single public \`initializeTodos(model)\` on the controller and call that from the route.
- CodeSmell/KISS: routes/hq/shift.js \`setupController\` (~lines 60-127) embeds a deeply-nested radio-task decision tree. Extract the radio math into the NEW \`app/utils/radio-accounting.js\` you create, exposing:
      export function radioAccounting(assets, radioMax) → { shiftRadios, eventRadios, collectCount, collectAtShiftEnd, overMax }
      export function computeRadioTodo({ isOffDuty, noMoreScheduled, accounting }) → taskConstant | null
  Move the duplicated radio getters in the controller AND the route's radio decision onto these helpers. Read the controller's current radio getters carefully and reproduce their logic EXACTLY.
- controllers/hq/shift.js:50-52 \`isShinyPenny\` returns a non-boolean → wrap in \`!!\`.
- controllers/hq/shift.js:234-246 dense \`endShiftNotify\` timesheet reconciliation → extract \`_reconcileTimesheetsToReview()\`.
- templates/hq/shift.hbs:212-216 \`{{#if this.assetsCheckedOut}}\` (array is always truthy in raw JS, but Ember {{#if}} treats empty array as falsy — STILL change to \`{{#if this.assetsCheckedOut.length}}\` for clarity/consistency and to match pendingItems gating). Verify it doesn't change rendered output.
- templates/hq/shift.hbs:17-20 vs 37-41: wrap the "suggested tasks" header in \`{{#if this.todoCount}}\` so "0 suggested tasks" + "All completed" can't show together; remove the dead \`{{#if this.todos}}\` guard at 22-26.
- NAMING: rename \`updateBarocde\` → \`updateBarcode\` in controllers/hq/shift.js:452 AND templates/hq/shift.hbs:163.
- templates/hq/shift.hbs:201-237: orphaned \`forceMarkOffSite\`/\`markOnSite\` controller actions vs misleading "ignore this warning" copy — reconcile (wire the copy to the real actions or remove dead actions). Preserve intent; if unclear, defer with note.
- templates/hq/shift.hbs:32-36 / 148-153: guard \`onDutyEntry.position.title\` and \`eventInfo.radio_max\` derefs against null.
- ${SELF_SERVE_CONTRACT} — YOU own app/templates/hq/shift.hbs:67: ensure it passes \`@selfServe={{...}}\` to <ShiftCheckInAlerts/> using the existing self-serve expression.
- routes/hq/shift.js: replace \`import {isEmpty} from "lodash"\` used only for an empty-string check with a native check (\`!controller.unsubmittedBarcode\`).
- OPTIONAL/RISKY (review's "namespace parent model instead of double setProperties"): only do this if you can update ALL flattened references safely; otherwise DEFER with a note — do not half-apply it.`,
  },
  {
    key: 'checkinout',
    label: 'shift-check-in-out + modals',
    files: [
      'app/components/shift-check-in-out.js',
      'app/components/shift-check-in-out.hbs',
      'app/helpers/hyperlink-text.js',
    ],
    creates: [
      'app/components/shift-correct-position-modal.{js,hbs} (if you split)',
      'app/components/shift-blocked-modal.{js,hbs} (if you split)',
      'app/components/shift-too-short-modal.{js,hbs} (if you split)',
    ],
    usesHqAction: true,
    tasks: `Fix ALL of these:
- SECURITY (High) shift-check-in-out.js ~250-254 \`_showShiftInfo\`: \`slot_url\` flows through \`hyperlinkText()\` (does NOT escape HTML) then \`htmlSafe()\` into a modal → stored XSS. FIX: HTML-escape the input BEFORE hyperlinking. First read app/helpers/hyperlink-text.js and every other caller of it (grep the repo). If escaping inside the helper (via Handlebars.Utils.escapeExpression / a textContent round-trip) is safe for all callers, do it there (fixes XSS everywhere). If any caller already passes pre-escaped/trusted HTML, instead escape at THIS call site only. Never pass an un-escaped server string to htmlSafe.
- BUG shift-check-in-out.js:212 \`this.args?.startShiftNotify()\` throws if the callback is absent → \`this.args.startShiftNotify?.()\` (match endShiftNotify?.() at 314/388).
- BUG shift-check-in-out.js:386 \`deleteEntry\` does not await \`updateOnDuty()\` (inconsistent with 215/318/447) → \`await this.session.updateOnDuty();\`.
- BUG shift-check-in-out.js ~425/432 \`_updatePosition\` ignores its \`position_id\` parameter and reads \`this.newPositionId\`; \`confirmForcePosition\` passes \`forcePosition.id\` which is dead → make \`_updatePosition\` use its parameter; rename the param to \`positionId\` (camelCase).
- BUG shift-check-in-out.js:232 user message says "does hold ... in order to start" — inverted; should read "does NOT hold ... cannot start". Fix wording to match intent.
- Declare missing @tracked / instance fields: \`isSubmitting\` (@tracked, default false), and the constructor-assigned arrays \`activePositions\`/\`noTrainingRequiredPositions\`/\`signinPositions\` (declare as fields). Also declare \`newPositionId = null\` and \`forceSlotId = null\` explicitly.
- Add double-submit guards: \`if (this.isSubmitting) return;\` at the top of mutating handlers (_signInPerson / endShiftAction / _signoff / _updatePosition) and set/reset isSubmitting in try/finally; bind \`@disabled={{this.isSubmitting}}\` on the relevant submit buttons in the template.
- DRY: the operator self-sync \`if (+person.id === session.userId) await session.updateOnDuty()\` is duplicated 4× → extract \`async _refreshNavIfSelf()\` and call it from all 4 sites.
- DRY: \`confirmForceStart\` vs \`confirmForcePosition\` (gated by an \`isPositionUpdate\` mode flag) duplicate the force/blocker confirmation flow → collapse into ONE flow that stores the action to invoke; remove the \`isPositionUpdate\` branching and the duplicated template branches.
- FILE SPLIT: shift-check-in-out.hbs (~288 lines) inlines three modals (correct-position, blocked/force, too-short). Extract each into its own component (ShiftCorrectPositionModal, ShiftBlockedModal, ShiftTooShortModal), each receiving args + a callback, leaving ShiftCheckInOut to orchestrate sign-in/sign-off. Do this ONLY if you can keep behavior identical; otherwise defer with a note.
- shift-check-in-out.js:57 add missing semicolon on \`forceShiftValidations\`.
- shift-check-in-out.js ~501-504 \`selectedPosition\` uses a string/number == compare and is likely dead → remove if truly unused, else fix the comparison.
- The re-typed "report to the Tech Ninjas" default-case strings → use the shared fallback in the hq-action service where you migrate POSTs, or a shared constant.
- Migrate this component's network mutations to \`@service hqAction\` (perform / saveWithRollback) where it cleanly applies, preserving behavior.`,
  },
  {
    key: 'alerts',
    label: 'shift-check-in-alerts',
    files: [
      'app/components/shift-check-in-alerts.js',
      'app/components/shift-check-in-alerts.hbs',
    ],
    creates: [],
    usesHqAction: false,
    tasks: `Fix ALL of these:
- BUG (High) ${SELF_SERVE_CONTRACT} — YOU own shift-check-in-alerts.{js,hbs}: change the template branch at ~line 46 from \`@isSelfServe\` to \`@selfServe\` and standardize on the single name \`@selfServe\` everywhere in this component. (The parent template is fixed by the core group.)
- EDGECASE shift-check-in-alerts.js:19 \`hasTrainingNoRequiredPositions\` derefs \`positions\` unguarded and :27 \`trainingNotPassed\` derefs \`eventInfo\` unguarded → add \`const {positions = []} = this.args;\` style defaults and optional-chaining / \`?? false\` so missing async payloads don't crash.
- shift-check-in-alerts.js:11-15 \`userCanForceCheckIn\` is set as a constructor field → convert to a getter.
- shift-check-in-alerts.js:22-29 redundant if/else in \`trainingNotPassed\` → simplify to a direct boolean return.
- Replace \`import {isEmpty} from "lodash"\` with a native check or @ember/utils.`,
  },
  {
    key: 'pogs',
    label: 'hq-pogs + guidelines',
    files: [
      'app/components/hq-pogs.js',
      'app/components/hq-pogs.hbs',
    ],
    creates: ['app/components/hq-pog-guidelines.{js,hbs}'],
    usesHqAction: true,
    tasks: `Fix ALL of these:
- BUG (systemic) optimistic mutation without rollback in \`redeemForFullMealPog\`, \`saveCancelledPog\`, \`_commonPogSave\`: status is set before save() and the catch only calls handleErrorResponse → migrate these saves to \`@service hqAction\`'s \`saveWithRollback(record, {...})\` so a failed save rolls back the record.
- Declare \`@tracked isSubmitting = false;\`; bind \`@disabled={{this.isSubmitting}}\` on the pog submit buttons; guard \`savePog\` (~152-160) and the issue handlers (162/174/195/203) against double-click via isSubmitting.
- Declare \`pogIssueForm\` explicitly; remove dead \`moreInfo\` (49/124/146), dead \`@tracked pog\` (45), dead \`pogIssueInfo\`.
- Replace wrapper actions \`recordFullMealPog\`/etc (93-114) with template \`{{fn this.setupToIssue "meal"}}\` style bindings.
- hbs:316 \`this.pogType\` does not exist (empty modal title) → use \`{{this.pogToEdit.pogLabel}}\`.
- FILE SPLIT hbs:138-257: ~120 lines of static meal-pog policy copy → extract into a new \`<HqPogGuidelines/>\` component.
- hbs:5-21 invalid \`<p>\` wrapping \`<div>\` → use \`<div>\`.
- hbs:97-105 \`{{else if (not pog.isCancelled)}}\` is always true → plain \`{{else}}\`.
- hbs:138 magic string \`"shower"\` → a \`POG_SHOWER\` constant.
- js:26-33/307-310 \`MENTOR_POSITIONS\`/\`isMentor\`: self-serve-pog logic covers only Mentors but the copy says Sandman + Gerlach Patrol too → reconcile and rename to \`SELF_SERVE_POG_POSITIONS\`. If the correct position set is ambiguous, keep current behavior and DEFER the copy/position reconciliation with a note.`,
  },
  {
    key: 'assets',
    label: 'hq-asset-table',
    files: [
      'app/components/hq-asset-table.js',
      'app/components/hq-asset-table.hbs',
    ],
    creates: [],
    usesHqAction: true,
    tasks: `Fix ALL of these:
- BUG hq-asset-table.js:72 \`this.isSubmitting\` is referenced but never declared (so \`@disabled\` is dead) → declare \`@tracked isSubmitting = false;\` and set/reset it around the save; ensure \`@disabled={{this.isSubmitting}}\` works.
- hbs:51 \`colspan="8"\` should be \`7\`.
- js:22-24 duplicate \`typeLabel\` → use the model's \`ap.asset.typeLabel\` and drop the \`TypeLabels\` import.
- js:48-52 \`changeAssetAttachment\` has wrong copy-pasted JSDoc → correct it.
- js:32-46 \`assetCheckInAction\` pokes a single \`checked_in\` attribute instead of normalizing/unloading the record → fix per the review (re-read the saved record / unload as appropriate) WITHOUT changing behavior; if risky, defer with note.
- js:76-89 \`submitAsset\` edits \`attachment_id\` but displays \`ap.attachment.description\`; the display is stale after save → ensure the save response embeds the updated attachment, or re-read the chosen option for display.
- Consider migrating the save to \`@service hqAction\` \`saveWithRollback\`; and a cached getter for \`attachmentOptions\` (Low hygiene).`,
  },
  {
    key: 'provisions',
    label: 'hq-provision-info + section',
    files: [
      'app/components/hq-provision-info.js',
      'app/components/hq-provision-info.hbs',
      'app/components/hq-shift-manage-section.hbs',
    ],
    creates: ['app/constants/event-periods.js'],
    usesHqAction: false,
    tasks: `Apply the review's "Refactored Example" for hq-provision-info essentially verbatim (it is in ${REVIEW_DOC}):
- Create \`app/constants/event-periods.js\` exporting \`EVENT_PERIOD_ROWS = [{key:'pre',label:'Pre-Event'},{key:'event',label:'Event Week'},{key:'post',label:'Post-Event'}]\`.
- Rewrite hq-provision-info.js: remove the \`@action periodRow\` that builds HTML via string concat + htmlSafe; remove dead \`onlyPogs\` getter and its \`isEmpty\` import; remove dead \`periodLabel\`/constructor and the \`EventPeriodLabels\` import. Add \`periodRows = EVENT_PERIOD_ROWS\` and a guarded \`period = (key) => this.args.eventPeriods?.[key] ?? {current:false, hasPass:false}\`.
- Rewrite hq-provision-info.hbs to render the three period rows declaratively with \`{{#each this.periodRows}}\` + \`{{#let (this.period row.key) as |week|}}\`, producing byte-equivalent markup to today's output and using NO htmlSafe. Fix the invalid \`<p>\`-wrapping-\`<div>\`. Guard the \`eventPeriods[period]\` deref via the period() helper.
- hq-shift-manage-section.hbs: it's a thin wrapper over <UiSection>. Either document why it exists with a comment, or inline-and-delete it — but deleting requires editing its callers which you do NOT own, so prefer adding a brief explanatory comment and replacing the \`right=2\` magic spacing with a named/standard utility. DEFER deletion with a note.`,
  },
  {
    key: 'timesheet',
    label: 'hq-timesheet-verification',
    files: [
      'app/components/hq-timesheet-verification.js',
      'app/components/hq-timesheet-verification.hbs',
    ],
    creates: [],
    usesHqAction: true,
    tasks: `Fix ALL of these:
- BUG (systemic) \`toggleEntryVerified\` mutates \`review_status\` before save with no rollback → migrate to \`@service hqAction\` \`saveWithRollback\`.
- BUG js:32-34 \`hasUnreviewedTimesheet\` assumes \`timesheetsToReview\`/\`unverifiedTimesheets\` is an array but it can be undefined before endShiftNotify → \`(this.args.unverifiedTimesheets ?? []).find(...)\`.
- BUG js:42-54 / hbs:85-88 concurrent verification actions: only \`entry.isSaving\` guards, leaving a window for double-fire → add an explicit per-entry pending flag that disables all three buttons while a save is in flight.
- BUG js:87-106 \`cancelEntryCorrection\`/\`savedEntryCorrection\` deref \`this.entry\` with no guard and don't null it on close; completion logic assumes the server flipped review_status synchronously → guard \`this.entry\`, null it on close, base completion on the persisted status.
- EDGECASE js:127-130 orphaned \`timesheet-missing\` createRecord: seed \`person_id\` and \`deleteRecord()\` if the form is abandoned.
- js:49 recompute → use \`entry.isVerified\`; extract the toast message strings to constants.
- js:93-99 stale JSDoc on \`savedEntryCorrection\`; js:89/102 duplicated pseudo-field cleanup → extract \`_resetCorrectionState()\`.
- hbs:84 \`justify-between\` → \`justify-content-between\` (also fix the leading-space typo); hbs:117-119 \`&nbsp;\` spinner spacer hack → proper spacing utility; hbs:60 grammar "Entry times is"; hbs:78 the ignoring branch is missing its wrapper \`<div>\`.`,
  },
  {
    key: 'todo',
    label: 'hq-todo-task',
    files: [
      'app/components/hq-todo-task.hbs',
    ],
    creates: ['app/components/hq-todo-task.js', 'app/constants/hq-todo.js (if needed for blink/task constants)'],
    usesHqAction: false,
    tasks: `Fix ALL of these:
- hbs:1-13 three near-identical branches → add a backing component class \`app/components/hq-todo-task.js\` (template-only today) with getters \`iconName\` / \`iconType\` / \`statusClass\`, and collapse the template to a single \`<div>\` driven by those getters. Keep rendered output identical for every todo status.
- Add an unknown-task message fallback: \`{{or @todo.message @todo.task}}\`.
- If \`blink\` state is read in the template, mark it @tracked (define task/blink constants in \`app/constants/hq-todo.js\` if that helps clarity). Do not change behavior.`,
  },
]

// ---------------------------------------------------------------------------
phase('Foundation')
log(`Implementing all review findings across ${GROUPS.length} disjoint file-groups on branch hq-shift-architect-fixes`)

const foundation = await agent(
  `${GLOBAL_RULES}

You are creating ONE new shared file and nothing else: \`app/services/hq-action.js\`.

${HQ_ACTION_CONTRACT}

Read app/components/hq-pogs.js, app/components/hq-asset-table.js, and app/services (look for an existing 'house' service and how 'ajax'/'toast' are used) to match idioms EXACTLY. Then write app/services/hq-action.js. Do not modify any other file. Return a short description of the final public API you created (method signatures + how errors/toasts are handled) so consumer agents can rely on it.`,
  { label: 'foundation:hq-action', phase: 'Foundation' }
)

// ---------------------------------------------------------------------------
phase('Implement')
// Disjoint file ownership → safe to run all groups concurrently in one tree.
const results = await parallel(GROUPS.map((g) => () =>
  agent(
    `${GLOBAL_RULES}

${g.usesHqAction ? `A shared service is already created. Its API:\n${foundation}\n\nUse it via \`@service hqAction;\` (import { inject as service } from '@ember/service'). ${HQ_ACTION_CONTRACT}\n` : ''}
You OWN exactly these files (edit only these${g.creates.length ? ', plus create the NEW files listed' : ''}):
OWNED: ${g.files.join(', ')}
${g.creates.length ? 'CREATE: ' + g.creates.join(', ') : ''}

TASKS:
${g.tasks}

When done, verify your edits are internally consistent (no references to symbols you removed, imports cleaned up). Return JSON-free prose: (1) a bullet list of changes you made per file, (2) a "DEFERRED:" section listing any finding you intentionally skipped and exactly why.`,
    { label: `impl:${g.key}`, phase: 'Implement' }
  ).then((summary) => ({ group: g.key, label: g.label, summary }))
))

const done = results.filter(Boolean)
log(`Implementation complete: ${done.length}/${GROUPS.length} groups finished`)

// ---------------------------------------------------------------------------
phase('Stabilize')
// Single agent, sequential — safe to touch any file now that parallel edits are done.
const stabilize = await agent(
  `You are stabilizing the working tree after a large multi-file refactor of the /hq/:person_id/shift route on branch hq-shift-architect-fixes.

Run, in order, and FIX what you can:
1. \`npm run lint:fix\` then \`npm run lint:js\` and \`npm run lint:hbs\` — fix every lint error introduced by the refactor (unused imports, undeclared vars, template syntax). Re-run until clean or only pre-existing warnings remain.
2. \`npx ember build\` (or \`npm run build\`) — it MUST compile. Fix any build/template-resolution errors (e.g. a newly-extracted component not registered, a renamed action not updated in its template, a missing import). New components created this run: shift-correct/blocked/too-short modals, hq-pog-guidelines, hq-todo-task.js, the hq-action service, radio-accounting util, event-periods constants — make sure references resolve.
3. \`npx ember test --filter="shift-check-in-out"\` if it runs quickly — report pass/fail; do NOT block on a hanging/slow full suite.

Constraints: you may edit any file, but ONLY to fix errors introduced by the refactor — do not revert intended fixes or add new features. If a fix would require reverting a finding's intended change, prefer the minimal adjustment that keeps both the fix and a green build.

Return: the final lint status, the final build status (pass/fail + any remaining errors verbatim), test result if run, and a list of any files you had to touch to stabilize.`,
  { label: 'stabilize', phase: 'Stabilize' }
)

// ---------------------------------------------------------------------------
phase('Report')
const report = await agent(
  `Write the final implementation report (Markdown) for applying the /hq/:person_id/shift architecture-review findings on branch hq-shift-architect-fixes. Be concise and factual — do not pad.

FOUNDATION (shared service created):
${foundation}

PER-GROUP CHANGE SUMMARIES:
${done.map((r) => `### ${r.group} (${r.label})\n${r.summary}`).join('\n\n')}

STABILIZATION RESULT:
${stabilize}

Produce:
# /hq/:person_id/shift — Fixes Implemented
## Summary — one paragraph: what landed, build/lint status.
## New Shared Modules — hq-action service, radio-accounting util, event-periods constants, hq-pog-guidelines, the extracted modals, hq-todo-task.js — one line each.
## Changes by File — group the per-file bullets above.
## Deferred / Not Applied — consolidate every DEFERRED item from the groups, each with its reason, so the user knows exactly what was NOT done and why.
## Verification — lint + build (+ test) status, and a recommended next step (run full \`npm test\`, manual smoke of the HQ shift page).
Output only the Markdown.`,
  { label: 'report', phase: 'Report' }
)

return {
  reportMarkdown: report,
  groupsImplemented: done.length,
  stabilization: stabilize,
}
