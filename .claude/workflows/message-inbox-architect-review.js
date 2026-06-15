export const meta = {
  name: 'message-inbox-architect-review',
  description: 'Harsh Software Architect review of the <MessageInbox> component family (inbox, show, thread, new, person-message model + validation) with verified findings and refactored code',
  whenToUse: 'When you want a structured architectural review of the Clubhouse Messages UI (MessageInbox and its child components) — severity-ranked findings (bugs/security/perf/maintainability/DRY/KISS/edge-cases) plus a refactored example.',
  phases: [
    { title: 'Survey', detail: 'Map the data flow: inbox load/send -> show -> thread render, and the person-message model state' },
    { title: 'Review', detail: 'One reviewer per file-group emits severity-ranked findings' },
    { title: 'Verify', detail: 'Adversarially verify each Critical/High finding against the code' },
    { title: 'Synthesize', detail: 'Assemble report + refactored code from verified findings' },
  ],
}

// ---- Work-list: every file the <MessageInbox> feature touches ----
// MessageInbox is the orchestrator: it loads the mailbox over raw ajax (NOT the
// store's find), mutates the raw JSON, pushes each row through house.pushPayload,
// and owns send/markread. MessageShow wraps a top message + its replies and the
// reply form. MessageThread renders a single message/reply bubble. MessageNew is
// the compose modal (recipient/sender pickers + form). person-message is the
// Ember Data model (note: it carries @tracked VIEW state `isHidden`).
const BATCHES = [
  { key: 'model',   files: ['app/models/person-message.js', 'app/validations/person-message.js'] },
  { key: 'inbox',   files: ['app/components/message-inbox.js', 'app/components/message-inbox.hbs'] },
  { key: 'show',    files: ['app/components/message-show.js', 'app/components/message-show.hbs'] },
  { key: 'thread',  files: ['app/components/message-thread.js', 'app/components/message-thread.hbs'] },
  { key: 'new',     files: ['app/components/message-new.js', 'app/components/message-new.hbs'] },
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

const REVIEW_RUBRIC = `You are a harsh, senior Software Architect reviewing PRODUCTION code for the Clubhouse Messages feature (\`<MessageInbox>\` and its children) of an Ember.js 5 (Octane/Glimmer) + Ember Data app. This UI shows a person's "mailbox": a list of top messages, each with a thread of replies; a person can read/unread, reply, and compose new messages. It renders in four contexts — HQ interface (staff messaging a ranger), Person Manage, Me > Messages, and a "contact" mode for non-ranger acquaintances — toggled by the args \`@isHQInterface\`, \`@isMe\`, \`@isContact\`.

DATA FLOW you must understand before judging:
- app/components/message-inbox.js is the orchestrator. On construct it either sets up a contact compose form OR registers \`this.session.loadMessages = this._loadMessages\` (a GLOBAL mutable callback on the session singleton) and calls _loadMessages().
- _loadMessages() does \`store.unloadAll('person-message')\`, then a RAW \`ajax.request('messages', ...)\` (not store.findAll). It then MUTATES each raw JSON row (\`message.personIdInbox = personId\`, \`message.isHidden = ...\`, \`message.replies = new TrackedArray(replies.map(pushPayload))\`) BEFORE calling \`house.pushPayload('person-message', message)\`. A \`messagesHidden\` plain-object cache preserves each row's open/closed state across reloads. \`isRetrieving\` is a NON-tracked guard flag (there is an inline comment admitting Ember "gets cranky" about read-then-write of a tracked var).
- Counts: unreadCount / unreadMessageCount / unreadReplyCount are @cached getters that loop the messages; updateUnreadCount() writes \`person.unread_message_count\` via the legacy \`set()\` and may write \`session.unreadMessageCount\`.
- Sending: sendMessage(model, isValid, callback, topMessage, record) is a FIVE-positional-arg action shared by inbox compose, MessageNew, and MessageShow replies; on success it unshifts/pushes the record into the tracked arrays.
- MessageShow (app/components/message-show.js/.hbs) wraps a top message + replies, owns the reply form, and mutates \`args.message.isHidden\` directly. MessageThread (app/components/message-thread.js/.hbs) renders one bubble. MessageNew (app/components/message-new.js/.hbs) is the compose modal with recipient/sender pickers. person-message.js is the Ember Data model and carries @tracked VIEW state (\`isHidden\`) plus helper methods (isUnread, unreadReplyCount, fromName, lastReply).

Read every listed file IN FULL with the Read tool before judging. When a finding depends on a service, model, constant, validation, or sibling component, OPEN that file to confirm before asserting — in particular:
- Which services each component injects (e.g. does MessageShow inject \`session\`? Its template references \`this.session.userId\` — confirm whether that service exists on the component).
- Whether getters/methods referenced in a template actually exist on the model/component (e.g. message-thread.hbs uses \`@message.isSenderTeam\`; message-new.hbs uses \`this.askForCallsign\`; message-new.js uses \`this.fromName\` — confirm each is actually defined, or is a silent no-op/always-falsy).
- house.pushPayload semantics (app/services/house.js) and whether mutating the raw payload before pushing actually persists those fields onto the model.

Evaluate against ALL of:
1. Bugs: logic errors, off-by-one, null/undefined handling, async races, unhandled rejections, stale @tracked state. (Look hard at: updateUnreadCount dereferencing \`person.idNumber\` after only guarding \`if (person)\`; template references to undefined services/getters silently evaluating falsy; the from-name 5-char validation in message-new.js guarding on a variable that is never assigned; double-binding of \`@toggleRead\` / \`fn @toggleRead @message\`.)
2. Security: PII / data exposure (callsigns, photos, message bodies), missing permission gating (canSendMessages / ALLOW_TO_MESSAGE — is read/markread gated too?), IDOR via person_id passed to messages / markread endpoints, trusting raw API shape.
3. Performance: @cached getters that re-loop on every dependency change, store.unloadAll + full re-fetch on every reload, mutating-then-mapping the payload, TrackedArray rebuilds.
4. Maintainability: duplication (DRY) — unread-count logic split between inbox and the model; \`lastReply\` reimplemented in message-thread.js when the model already has it; five-positional-arg sendMessage; the messagesHidden side cache; the session.loadMessages global callback.
5. Edge cases: what inputs break this? — a person with no callsign, replies array missing/null, two MessageInbox instances mounting (global session.loadMessages collision), sending while a reload is in flight, isContact vs isMe vs isHQInterface arg combinations, unread when sender == viewer.
6. Code smells / overly complex nested logic: commented-out dead code (message-show.js messageIsHidden), unused @tracked fields (inbox openNewMessage / messageToShow), deeply nested template conditionals, view state (\`isHidden\`) living on the Ember Data model.
7. Files/sections that should be SPLIT or whose logic belongs elsewhere (mailbox-loading + sending could be a service; counts belong on the model/service; MessageNew's picker is a second component crammed into one).
8. Poor or INCONSISTENT naming (project convention: CSS dash-case, form fields snake_case, API fields snake_case, vars/methods camelCase, constants UPPER_SNAKE, array/object constants Capitalized). Flag camelCase view fields sitting on a snake_case API model, \`personIdInbox\` bolted onto raw payload, leading-underscore actions exposed as public callbacks.
9. Logic that should be EXTRACTED into reusable helpers/services (a MessagesService owning load/send/markread/counts; a single unread predicate shared by model + inbox; a sendMessage options object instead of 5 positional args).

For EVERY issue produce: severity (Critical/High/Medium/Low), file, location (line or named method/section), the specific problem, and a concrete fix.
Be harsh but correct — do NOT invent issues. Only report what is actually in the files. Prefer precise line references.
Critical/High is reserved for real correctness/security problems (crash on common input, wrong count/state shown, PII exposed, broken validation, dead template branch that hides required UI, missing auth). Style/duplication/naming is Medium/Low.`

// ---------------------------------------------------------------------------
phase('Survey')
log(`Reviewing <MessageInbox> family — ${BATCHES.reduce((n, b) => n + b.files.length, 0)} files across ${BATCHES.length} groups`)

const survey = await agent(
  `Survey the architecture of the \`<MessageInbox>\` component family in this Ember 5 (Octane/Glimmer) + Ember Data app. Read IN FULL: app/components/message-inbox.{js,hbs}, app/components/message-show.{js,hbs}, app/components/message-thread.{js,hbs}, app/components/message-new.{js,hbs}, app/models/person-message.js, and app/validations/person-message.js. Also open app/services/house.js (the pushPayload method) and the ALLOW_TO_MESSAGE constant in app/constants/person_status.js, and skim where MessageInbox is mounted (app/templates/hq/messages.hbs and the me/person message templates) to see which args (@isHQInterface/@isMe/@isContact) each context passes.
Report (as concise prose an architect would put atop a review):
- The load path: how _loadMessages() fetches over raw ajax, mutates the raw JSON rows, and pushes them through house.pushPayload; what the messagesHidden cache and the non-tracked isRetrieving guard are doing; and the global \`session.loadMessages\` callback registration/teardown.
- The send/markread path: the five-positional-arg sendMessage shared across inbox/MessageNew/MessageShow, and how toggleRead + updateUnreadCount mutate state and counts.
- The render path: inbox -> MessageShow (top message + replies + reply form) -> MessageThread (single bubble), and which args/getters each child relies on — call out any template reference to a service or getter that may not exist on the backing component/model (e.g. message-show.hbs \`this.session.userId\`, message-thread.hbs \`@message.isSenderTeam\`, message-new.hbs \`this.askForCallsign\`).
- Where view state lives on the Ember Data model (\`isHidden\`) and where unread-count logic is duplicated between the inbox and the model.
- Cross-cutting conventions and inconsistencies that recur and could be centralized into a MessagesService or shared helpers.
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
        `Adversarially verify this code-review finding about the <MessageInbox> component family. Open the cited file (and any service/model/constant/validation/sibling it depends on — e.g. app/services/house.js, app/models/person-message.js, app/constants/person_status.js, the sibling message-* components) and try to REFUTE it. A finding is NOT real if it mistakes an Ember/Glimmer/Ember-Data idiom for a bug, cites a line that does not say what is claimed, assumes behavior the surrounding code already guards, or is pure opinion dressed as a defect. Pay special attention to claims about a template referencing a service/getter that "doesn't exist" (confirm the backing component's @service injections and the model's getters), about validation/guards being dead (confirm the variable is truly never assigned), and about null dereferences (confirm the guard really doesn't cover the deref). Confirm against the real lines.\n\nFINDING:\nfile: ${f.file}\nlocation: ${f.location}\nseverity: ${f.severity}\ncategory: ${f.category}\nproblem: ${f.problem}\nproposed fix: ${f.fix}\n\nReturn your verdict.`,
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
  `You are the lead Software Architect writing the final review of the \`<MessageInbox>\` component family in this Ember 5 app. Be harsh, specific, and actionable.

SURVEY:
${survey}

VERIFIED FINDINGS (already adversarially checked; refuted ones removed):
${findingsTable}

Write a Markdown report with these sections:
# <MessageInbox> — Software Architecture Review
## Executive Summary — overall health verdict, top 3 systemic problems, and a maintainability/readability grade (A–F) with justification.
## Findings by Severity — group the findings above under Critical / High / Medium / Low. For each: file:location, what's wrong, how to fix. Merge findings that recur across files into a single "systemic" entry naming all affected files.
## DRY / KISS Assessment — the biggest duplication and over-complexity patterns (unread-count logic split between inbox and model, lastReply reimplemented in message-thread, five-positional-arg sendMessage, messagesHidden side cache, raw-payload mutation before pushPayload), with the concrete shared helper/service API you'd extract (e.g. a \`MessagesService\` with \`load(personId)\`/\`send(message, opts)\`/\`markRead(message)\`/\`unreadCount(personId)\`, and a single \`isUnread(message, personId)\` predicate).
## File-Split / Extraction Recommendations — what belongs in a service or on the model vs the component, whether view state (\`isHidden\`) should leave the Ember Data model, and whether MessageNew's picker should be its own component.
## Refactored Example — pick the single file with the worst combination of issues (most likely app/components/message-inbox.js), and provide a COMPLETE refactored version in a fenced code block that extracts load/send/markread/counts into a service (or shared helpers), replaces the 5 positional args with an options object, removes dead @tracked fields, fixes any confirmed null-deref / dead-validation bug, and preserves IDENTICAL functionality (same endpoints, same rendered data, same behavior across @isMe/@isContact/@isHQInterface). Above it, state which file and why. Show any extracted service/helper (fenced) and a 2–3 line note of how the refactored file now uses it. For each CONFIRMED template bug (e.g. \`this.session.userId\` with no injected session, \`@message.isSenderTeam\` with no such getter, \`this.askForCallsign\`/\`this.fromName\` never defined), include the one-line fix.
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
