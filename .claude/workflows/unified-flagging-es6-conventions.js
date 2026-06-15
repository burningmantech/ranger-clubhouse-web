export const meta = {
  name: 'unified-flagging-es6-conventions',
  description: 'Audit and fix the unified-flagging component files to use ES6 conventions (incl. async/await)',
  phases: [
    { title: 'Audit', detail: 'One agent per file: find non-ES6 / promise-chain patterns, produce paste-ready edits' },
    { title: 'Implement', detail: 'Apply the ES6 / async-await fixes per file (disjoint files, in parallel)' },
    { title: 'Verify', detail: 'Lint + adversarial behavior-preservation review' },
  ],
}

// The component files under review. Disjoint, so they can be audited and
// edited fully in parallel.
const FILES = [
  'app/components/unified-flagging.js',
  'app/components/unified-flagging-row.js',
  'app/components/unified-flagging-bonk.js',
]

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'isClean', 'findings'],
  properties: {
    file: { type: 'string' },
    isClean: { type: 'boolean', description: 'True if the file ALREADY fully follows ES6 conventions and async/await — no edits needed.' },
    findings: {
      type: 'array',
      description: 'One entry per non-ES6 / non-async-await pattern that should change. Empty if isClean.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'location', 'problem', 'oldCode', 'newCode'],
        properties: {
          category: {
            type: 'string',
            enum: ['promise-chain-to-async-await', 'var-to-let-const', 'function-to-arrow', 'string-concat-to-template-literal', 'callback-to-for-of', 'object-assign-to-spread', 'destructuring', 'other'],
          },
          location: { type: 'string', description: 'Symbol / getter / method name and approximate line.' },
          problem: { type: 'string', description: 'Why this is not idiomatic ES6 / async-await.' },
          oldCode: { type: 'string', description: 'Exact current snippet to replace (must match the file verbatim, enough to be unique).' },
          newCode: { type: 'string', description: 'Paste-ready ES6 replacement that preserves behavior EXACTLY (same return value, same error handling, same reactivity).' },
        },
      },
    },
  },
}

const IMPL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'changed', 'appliedCount', 'summary'],
  properties: {
    file: { type: 'string' },
    changed: { type: 'boolean' },
    appliedCount: { type: 'integer' },
    summary: { type: 'string' },
  },
}

const LINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['passed', 'output'],
  properties: { passed: { type: 'boolean' }, output: { type: 'string' } },
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['behaviorPreserved', 'isIdiomaticEs6', 'issues'],
  properties: {
    behaviorPreserved: { type: 'boolean', description: 'True if every getter/method/action behaves identically to before (same return values, same error handling, same Glimmer reactivity).' },
    isIdiomaticEs6: { type: 'boolean', description: 'True if the files now consistently use ES6 conventions including async/await for all promise-based code.' },
    issues: { type: 'array', items: { type: 'string' }, description: 'Concrete regressions or remaining non-ES6 spots. Empty if clean.' },
  },
}

const ES6_GUIDANCE = `ES6 / modern-JS conventions to enforce (this is an Ember 5 / Glimmer Octane project — match the surrounding code):
- Convert .then()/.catch() promise CHAINS to async/await with try/catch. Preserve the exact return value and error handling. NOTE: a Glimmer @action that returns a promise should still return the awaited result the same way — keep the same error path (e.g. house.handleErrorResponse on failure).
- var -> const (or let only when reassigned).
- Standalone function expressions used as callbacks -> arrow functions (do NOT convert class methods/getters or @action methods to arrows — that changes 'this' / Glimmer semantics).
- String concatenation -> template literals.
- Object.assign({}, x) / manual copies -> spread (...).
- Prefer for...of or array methods over index loops where it reads cleaner — but ONLY if behavior is identical; do not over-refactor working forEach into churn for its own sake.
- Use destructuring where it genuinely clarifies.

DO NOT change public behavior, rename getters/methods, alter Glimmer decorators (@tracked, @cached, @action, @service), or touch the comments' meaning. Behavior preservation beats stylistic purity — only flag a change you are confident is a true no-op refactor.`

phase('Audit')
log(`Auditing ${FILES.length} unified-flagging files for ES6 / async-await conventions…`)

const results = await pipeline(
  FILES,
  // Stage 1: audit one file.
  (file) => agent(
    `Audit the file ${file} in this Ember project for ES6 convention adherence, especially async/await.

Read the file. ${ES6_GUIDANCE}

Return one finding per genuine improvement, each with a verbatim oldCode snippet and a paste-ready newCode replacement that preserves behavior EXACTLY. If the file already fully follows these conventions, set isClean=true and return an empty findings array.`,
    { schema: AUDIT_SCHEMA, phase: 'Audit', label: `audit:${file.split('/').pop()}` }
  ),
  // Stage 2: apply fixes for that file (only if there are findings).
  (audit, file) => {
    if (!audit || audit.isClean || audit.findings.length === 0) {
      return { file, changed: false, appliedCount: 0, summary: 'Already ES6-clean; no edits.' }
    }
    const editList = audit.findings
      .map((f, i) => `--- Finding ${i + 1} [${f.category}] @ ${f.location}\nPROBLEM: ${f.problem}\nREPLACE:\n${f.oldCode}\nWITH:\n${f.newCode}`)
      .join('\n\n')
    return agent(
      `Apply these ES6 / async-await refactors to ${file}. Edit the working tree with the Edit tool. Apply ONLY these changes; do not refactor anything else.

${editList}

After editing, confirm each old snippet is gone and behavior is unchanged (same return values, same error handling, same Glimmer decorators). Report how many you applied and a one-line summary.`,
      { schema: IMPL_SCHEMA, phase: 'Implement', label: `fix:${file.split('/').pop()}` }
    )
  }
)

const changed = results.filter(Boolean).filter((r) => r.changed)
log(`Applied edits to ${changed.length}/${FILES.length} files.`)

phase('Verify')
const [lint, review] = await parallel([
  () => agent(
    `Run \`npm run lint:js\` and \`npm run lint:hbs\` for this Ember project. Report pass/fail and quote any errors tied to these files: ${FILES.join(', ')}. (There is no lint:css script — do not run it.)`,
    { schema: LINT_SCHEMA, phase: 'Verify', label: 'lint' }
  ),
  () => agent(
    `Adversarially review the three edited files for behavior preservation and ES6 idiom:
${FILES.map((f) => `- ${f}`).join('\n')}

Read each file (and app/utils/intake-summaries.js for context). Confirm:
(1) Every getter/method/@action returns the SAME value and has the SAME error handling as a promise-chain version would (especially the noteSubmitted action in unified-flagging.js — it must still GET intake/<id>/history, merge {...person, ...result.person} into a NEW noteOverrides Map, and route failures to house.handleErrorResponse).
(2) No Glimmer semantics were broken: @tracked/@cached/@action/@service intact, no class method or @action converted to an arrow in a way that changes 'this', tracked Maps still reassigned (not mutated) so reactivity holds.
(3) Promise chains were genuinely converted to async/await where applicable, and the files read as idiomatic ES6.
List concrete issues; empty array if clean.`,
    { schema: REVIEW_SCHEMA, phase: 'Verify', label: 'behavior-review' }
  ),
])

return {
  filesAudited: FILES,
  edits: results.filter(Boolean).map((r) => ({ file: r.file, changed: r.changed, appliedCount: r.appliedCount, summary: r.summary })),
  lint: lint ?? { passed: false, output: 'lint agent did not return' },
  review: review ?? { behaviorPreserved: false, isIdiomaticEs6: false, issues: ['review agent did not return'] },
}
