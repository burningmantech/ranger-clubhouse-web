# Clubhouse 2.0 Design Skills

This document captures a small, curated set of reusable, scan-first UI patterns drawn from the Team Roster (`/ops/teams/:id`) and Potential Alphas (`/mentor/potentials`) pages. Each pattern is documented verbatim from its source so future work can reuse the same visual language and behavior without reinventing it.

## Table of Contents

- [Team Roster (/ops/teams/:id)](#team-roster-opsteamsid)
  - [Roster Legend](#roster-legend)
  - [Roster Filter / Controls Bar](#roster-controls-bar)
- [Unified Flagging — Potential Alphas (/mentor/potentials)](#unified-flagging--potential-alphas-mentorpotentials)
  - [Section Partitioning (Priority vs Other Potential Alphas)](#potentials-section-partitioning)
  - [Dense-Triage Accordion Row (PotentialAlphaRow)](#dense-triage-accordion-row)
- [Shared visual language](#shared-visual-language)

---

## Team Roster (/ops/teams/:id)

<a id="roster-legend"></a>
### Roster Legend

![Team Roster legend band decoding the roster grid glyphs](proofshot-artifacts/teams-10.png)

*Screenshot is an illustrative capture.*

**Purpose**

A static, single-line documentation band that decodes the glyphs and status abbreviations used in the roster grid below it (granted checkmark, NS variants, em-dash for not-granted, training-year note), so a reader can interpret each cell without prior knowledge.

**When to use**

Reach for this pattern when a dense data table or grid uses compact glyphs / colored abbreviations whose meaning is not self-evident. It is a key/legend explainer placed immediately above the data it annotates. Use it when the explanation is short enough to wrap inline as flex items rather than needing a popover or modal.

**Anatomy**

- Container band: `<div class="roster-legend mb-2">` — horizontal flex, wrapping, left-accent tinted card
- Leading label: `<span class="roster-legend-label">` — uppercase letterspaced "Legend:"
- Repeating explainer: `<span class="roster-legend-item">` — flex pair of glyph/abbr + meaning text (5 instances)
- Glyph slot inside an item: fa-icon check (success), or `<span class="roster-status-nw">NS</span>`, or `<span class="roster-status-never-worked">NS</span>`, or plain em-dash, or plain text

**Markup**

```handlebars
{{! ── Legend ── }}
<div class="roster-legend mb-2">
  <span class="roster-legend-label">Legend:</span>
  <span class="roster-legend-item">
    {{fa-icon "check" color="success" right=1}}
    position granted (date shown if known)
  </span>
  <span class="roster-legend-item">
    <span class="roster-status-nw">NS</span>
    <span>= granted, no shift worked</span>
  </span>
  <span class="roster-legend-item">
    <span class="roster-status-never-worked">NS</span>
    <span>= never worked any position</span>
  </span>
  <span class="roster-legend-item">
    — = not granted
  </span>
  <span class="roster-legend-item">
    Training positions show year last trained or taught.
  </span>
</div>
```

**Styles**

```scss
/* Legend card */
.roster-legend {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-left: 3px solid #6c757d;
  border-radius: 0 0.25rem 0.25rem 0;
  margin-bottom: 0.75rem;
}

.roster-legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #495057;
}

.roster-legend-label {
  font-weight: 600;
  color: #3f454d;
  margin-right: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* glyph styles referenced inside legend items */
.roster-status-nw {
  color: #9f6800;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.roster-status-never-worked {
  color: #adb5bd;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
```

**Design tokens**

- `#f8f9fa` — legend card background (subtle gray tint)
- `#6c757d` — left accent border color (3px solid)
- `border-radius: 0 0.25rem 0.25rem 0` — square left edge (under the accent border), rounded right corners
- `padding: 0.5rem 0.75rem` — card inner padding
- `gap: 1.25rem` — horizontal/vertical gap between legend items
- `gap: 0.35rem` — gap between glyph and its meaning text inside an item
- `margin-bottom: 0.75rem` (plus `mb-2` utility on the element) — spacing below the band
- `#3f454d` — label text color (darkest gray)
- `#495057` — legend item text color (mid gray)
- `letter-spacing: 0.06em` + text-transform uppercase + font-weight 600 — the "LEGEND:" label treatment
- `#9f6800` (bold, 0.72rem, ls 0.04em) — "NS" granted-but-no-shift glyph (amber/brown)
- `#adb5bd` (bold, 0.72rem, ls 0.04em) — "NS" never-worked glyph (light gray)
- `fa-icon "check" color="success"` — green Bootstrap success checkmark for granted
- `—` (em-dash) — literal text glyph meaning not granted

**Behavior**

Purely static/presentational. No JavaScript, no tracked state, no event handlers, no interaction. The band is rendered only when `{{#if this.people}}` is truthy (i.e. there are roster rows to annotate). `flex-wrap:wrap` lets items reflow onto additional lines at narrow widths. The two "NS" abbreviations are visually distinguished only by color (`#9f6800` amber = granted/no-shift vs `#adb5bd` gray = never worked), and the legend exists precisely to disambiguate them. The same glyph classes are reused live inside the roster grid cells, so the legend is a faithful key to actual cell rendering.

**Accessibility**

No explicit ARIA. Meaning is conveyed by color difference between the two identical "NS" tokens (`#9f6800` vs `#adb5bd`), which is a color-only distinction — but each is paired with descriptive text in the legend, so the legend itself mitigates this for the band. The accent border and tinted background are decorative. Recommendation if re-implementing: keep the descriptive text adjacent to each glyph (do not rely on color alone in the grid), and consider semantic markup or a `<dl>` if the key needs to be machine-readable; the success check relies on green color, so the textual label "position granted" is what carries meaning.

**Gotchas**

- The asymmetric border-radius (`0 0.25rem 0.25rem 0`) is intentional: the left edge must stay square so the 3px accent border reads as a flush left rail; rounding it would detach the border visually.
- Two legend items render the identical glyph text "NS" and differ ONLY by CSS class/color — do not collapse them; the amber `.roster-status-nw` and gray `.roster-status-never-worked` are semantically distinct.
- The check item uses `{{fa-icon "check" color="success" right=1}}` (the `right=1` adds trailing margin); the em-dash and training-note items are plain text with no glyph wrapper, so spacing relies on the item's `gap:0.35rem` and flex layout.
- `align-items:center` on the container vertically centers the small-font glyphs against the label; without it the 0.72rem NS tokens would sit on the text baseline and look misaligned.
- Both `mb-2` (Bootstrap utility) and `margin-bottom:0.75rem` (SCSS) apply to the element; the utility ordering/specificity can affect the final bottom margin — be aware of the double spacing source.
- The glyph SCSS classes (`.roster-status-nw` / `.roster-status-never-worked`) live up in the ~104-116 block, separate from the `.roster-legend` block (~274-300); a re-implementer must pull both regions.

**Source**

- [app/templates/ops/teams/manage.hbs:6](app/templates/ops/teams/manage.hbs#L6)
- [app/styles/tables.scss:104](app/styles/tables.scss#L104)
- [app/styles/tables.scss:274](app/styles/tables.scss#L274)
- [proofshot-artifacts/teams-10.png](proofshot-artifacts/teams-10.png)

---

<a id="roster-controls-bar"></a>
### Roster Filter / Controls Bar

![Team Roster controls bar with View filter, count pill, select links, and Revoke button](proofshot-artifacts/teams-10.png)

*Screenshot is an illustrative capture.*

**Purpose**

A single tinted horizontal toolbar that sits above the roster grid. It lets an operator filter the visible roster (View select), see a live count of matching people, bulk-select/deselect, and bulk-revoke the current selection — all driven from one controller source of truth so the count, the grid, and the Revoke button never drift out of sync.

**When to use**

Reach for this pattern when a data table needs a compact action/filter strip above it: a dropdown that re-filters rows, a live result count, select-all/deselect-all affordances, and a destructive bulk action that must be disabled until something is selected. Ideal when the filter result and the selection both need to feed the same bulk action.

**Anatomy**

- `div.roster-controls` — the tinted flex container (the bar itself)
- `div.d-flex.align-items-center.gap-2` — View label group: `span.fw-semibold.small` ("View:") + `ChForm::Select`
- `div.roster-controls-divider` — 1px vertical rule
- `span.roster-controls-count` — white count pill (pluralized person count)
- `div.roster-controls-divider` — 1px vertical rule
- `a.small` ("select all") + `a.small` ("deselect all") — bulk selection links
- `div.roster-controls-divider` — 1px vertical rule
- `UiButton` (size sm, type danger) — "Revoke Selected (n)", disabled until a selection exists
- `p.roster-info-note` — explanatory note rendered directly below the bar

**Markup**

```handlebars
{{! ── Controls bar ── }}
<div class="roster-controls">
  <div class="d-flex align-items-center gap-2">
    <span class="fw-semibold small">View:</span>
    <ChForm::Select @options={{this.viewFilterOptions}}
                    @onChange={{set-value this 'viewFilter'}}
                    @value={{this.viewFilter}}
                    @fieldSize="sm"
    />
  </div>
  <div class="roster-controls-divider"></div>
  <span class="roster-controls-count">{{pluralize this.viewPeople.length "person"}}</span>
  <div class="roster-controls-divider"></div>
  <a href {{on-click this.selectAll}} class="small">select all</a>
  <a href {{on-click this.deselectAll}} class="small">deselect all</a>
  <div class="roster-controls-divider"></div>
  <UiButton @size="sm" @type="danger" @onClick={{this.revokeSelected}}
            @disabled={{not this.selectedPeople.length}}>
    {{fa-icon "user-minus" right=1}} Revoke Selected ({{this.selectedPeople.length}})
  </UiButton>
</div>

<p class="roster-info-note">
  Showing team members and those with Recommended or Optional positions.
  Individuals with only Public positions and no team membership are excluded.
</p>
```

**Styles**

```scss
/* Controls bar */
.roster-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.75rem;
  background-color: #f0f2f5;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.roster-controls-count {
  font-weight: 700;
  color: #3f454d;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.15rem 0.5rem;
}

.roster-controls-divider {
  width: 1px;
  height: 1.5rem;
  background-color: #dee2e6;
  flex-shrink: 0;
}

/* Info note */
.roster-info-note {
  color: #6c757d;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  border-left: 2px solid #dee2e6;
}
```

**Design tokens**

- `#f0f2f5` — bar background (cool light-grey tint, distinguishes it from the lighter `#f8f9fa` legend card above)
- `#dee2e6` — bar border (1px solid), count-pill border, divider color, and info-note left border
- `0.375rem` — bar corner radius (Bootstrap default rounded)
- `0.6rem 0.75rem` — bar padding (vertical / horizontal)
- `0.75rem` — gap between flex children; also margin-bottom of the bar
- `#ffffff` — count pill background (pops against the tinted bar)
- `0.25rem` — count pill radius; `#3f454d` pill text; 700 pill font-weight; `0.15rem 0.5rem` pill padding
- `1px × 1.5rem` — divider dimensions; `flex-shrink:0` keeps them from collapsing on wrap
- `#6c757d` — info-note text (muted); 2px solid `#dee2e6` left border with 0.25rem left padding
- View label: `.fw-semibold .small` (semibold, small font); `ChForm::Select @fieldSize="sm"`; `UiButton @size="sm" @type="danger"`

**Behavior**

Single source of truth lives in the controller. `VIEW_FILTER` (exported const: `ALL='all'`, `NEVER_ALL='never-all'`, `NEVER_RECOMMENDED='never-recommended'`, `NEVER_OPTIONAL='never-optional'`) keys both the select's `viewFilterOptions` array and the `viewPeople` switch, preventing silent fall-through typos. The select binds `@value={{this.viewFilter}}` and `@onChange={{set-value this 'viewFilter'}}`; changing it mutates the `@tracked viewFilter` (default `VIEW_FILTER.ALL`). `viewFilter` feeds the `@cached get viewPeople()`, a switch that returns `this.people` filtered via `hasWorkedPositionIn(person, positions)` (a position is "worked" when a grant matches id and has `worked_on`): `NEVER_ALL` excludes anyone who has worked any recommended OR optional position; `NEVER_RECOMMENDED` excludes those who worked any recommended; `NEVER_OPTIONAL` excludes those who worked any optional; default returns everyone. `viewPeople` is the ONE list the grid renders (`{{#each this.viewPeople}}`), the count reads `(pluralize this.viewPeople.length "person")`, and `selectAll`/`deselectAll` iterate (setting `p.selected` true/false) — so changing the View instantly re-filters the table and the count together. `selectedPeople = viewPeople.filter(p => p.selected)`, so selection is always scoped to the currently-visible filter. The Revoke button label shows `this.selectedPeople.length` live and is gated by `@disabled={{not this.selectedPeople.length}}` — disabled (zero shown) until at least one visible person is selected. `revokeSelected` re-checks length (info modal if empty), confirms, then `_bulkRevoke` iterates `selectedPeople`, marking each person revoked/deselected on success and collecting failures (which stay selected for retry); per-person `showPerson` drives a `LoadingDialog`.

**Accessibility**

`ChForm::Select` renders a real native `<select>` so it is keyboard- and screen-reader-accessible; the adjacent "View:" span acts as a visible label but is not programmatically associated (no for/id linkage). `select all` / `deselect all` use anchor elements with `href` and `{{on-click}}` rather than buttons, so they are focusable but semantically links for actions (consider role/button semantics). The danger Revoke button is a real `UiButton` with a native disabled state, so assistive tech announces it as disabled until a selection exists, and the live `(n)` count in its label gives sighted users immediate feedback. The `fa-icon "user-minus"` is decorative alongside the text label. Contrast is adequate: `#3f454d` pill text on white, and muted `#6c757d` note text on the page background.

**Gotchas**

- The count, grid rows, `selectAll`/`deselectAll`, and `selectedPeople` all read from the SAME `@cached viewPeople` getter — never recompute the filter independently or they will drift. Anything that changes `viewFilter` must invalidate `viewPeople` (it does, via `@cached` + `@tracked`).
- `selectedPeople` is scoped to `viewPeople`, so switching the View can change which selected rows count toward Revoke — a person selected under one filter is excluded from `selectedPeople` if the new filter hides them (their `p.selected` stays true but they're filtered out).
- The Revoke disable guard is `@disabled={{not this.selectedPeople.length}}` — relies on length being 0/truthy; `revokeSelected` still re-guards with an info modal because the button is not the only entry path.
- Bulk revoke is NOT atomic: `_revokePerson` fires two sequential POSTs (positions then teams); a mid-failure can leave positions revoked but team membership intact. `_bulkRevoke` deliberately does not abort the batch on one failure — failed callsigns are reported and stay selected for retry (idempotent).
- `VIEW_FILTER` is the single source of truth shared by `viewFilterOptions` and the `viewPeople` switch; add a new filter mode in BOTH the const and the switch or it silently falls through to default (Show All).
- `roster-controls-divider` has `flex-shrink:0` so dividers survive flex-wrap; the bar wraps (`flex-wrap:wrap`) on narrow widths rather than overflowing.
- Public positions are intentionally excluded from revocation (`nonPublicPositionIds` only includes recommended + optional ids) — the info note and modal copy both state this; do not add public ids.

**Source**

- [app/templates/ops/teams/manage.hbs:30](app/templates/ops/teams/manage.hbs#L30)
- [app/controllers/ops/teams/manage.js:8](app/controllers/ops/teams/manage.js#L8) (VIEW_FILTER)
- [app/controllers/ops/teams/manage.js:22](app/controllers/ops/teams/manage.js#L22) (@tracked viewFilter)
- [app/controllers/ops/teams/manage.js:28](app/controllers/ops/teams/manage.js#L28) (viewFilterOptions)
- [app/controllers/ops/teams/manage.js:60](app/controllers/ops/teams/manage.js#L60) (@cached viewPeople switch)
- [app/controllers/ops/teams/manage.js:79](app/controllers/ops/teams/manage.js#L79) (selectAll/deselectAll/selectedPeople)
- [app/controllers/ops/teams/manage.js:118](app/controllers/ops/teams/manage.js#L118) (revokeSelected gating)
- [app/styles/tables.scss:245](app/styles/tables.scss#L245) (.roster-controls, -count, -divider)
- [app/styles/tables.scss:313](app/styles/tables.scss#L313) (.roster-info-note)
- [proofshot-artifacts/teams-10.png](proofshot-artifacts/teams-10.png)

---

## Unified Flagging — Potential Alphas (/mentor/potentials)

<a id="potentials-section-partitioning"></a>
### Section Partitioning (Priority vs Other Potential Alphas)

![Potential Alphas list partitioned into a priority group above an Other group](proofshot-artifacts/potentials.png)

*Screenshot is an illustrative capture.*

**Purpose**

Splits the flat Potential Alphas list into two titled groups so concerning people (raised Personnel flag, 3/Yellow or 4/FLAG team rank, or a prior mentor bonk) cluster at the top under "Rank 3/4 or Prior Mentor Bonk", while the benign majority sits below under "Other Potential Alphas". Implements a scan-first / worst-first reading order: the eye lands on the highest-risk cohort first.

**When to use**

Reach for this pattern whenever a long roster needs triage emphasis — when a subset of rows is materially more important to act on than the rest, and you want a hard visual partition plus a deliberate per-group ordering (severity-weighted up top, calm alphabetical below) rather than one undifferentiated sorted list.

**Anatomy**

- Outer conditional: renders the grouped layout only when `this.sortedPotentials.length` is truthy (else an empty-state message)
- Priority block: `div.uf-row-section` (rendered only if `this.priorityPotentials.length`)
  - `div.uf-row-section-title` — literal text "Rank 3/4 or Prior Mentor Bonk"
  - `div.uf-row-stack` — wraps an `{{#each this.priorityPotentials}}` of `<PotentialAlphaRow>`
- Other block: `div.uf-row-section` (rendered only if `this.otherPotentials.length`)
  - `div.uf-row-section-title` — literal text "Other Potential Alphas"
  - `div.uf-row-stack` — wraps an `{{#each this.otherPotentials}}` of `<PotentialAlphaRow>`
- Each `<PotentialAlphaRow>` receives `@person`, `@year`, and `@onSubmit={{this.noteSubmitted}}`

**Markup**

```handlebars
{{#if this.sortedPotentials.length}}
  {{#if this.priorityPotentials.length}}
    <div class="uf-row-section">
      <div class="uf-row-section-title">Rank 3/4 or Prior Mentor Bonk</div>
      <div class="uf-row-stack">
        {{#each this.priorityPotentials key="id" as |person|}}
          <PotentialAlphaRow @person={{person}} @year={{this.year}} @onSubmit={{this.noteSubmitted}} />
        {{/each}}
      </div>
    </div>
  {{/if}}

  {{#if this.otherPotentials.length}}
    <div class="uf-row-section">
      <div class="uf-row-section-title">Other Potential Alphas</div>
      <div class="uf-row-stack">
        {{#each this.otherPotentials key="id" as |person|}}
          <PotentialAlphaRow @person={{person}} @year={{this.year}} @onSubmit={{this.noteSubmitted}} />
        {{/each}}
      </div>
    </div>
  {{/if}}
{{else}}
  <p>
    <b class="text-danger">
      {{#if this.mentees}}
        No potential Alphas matched the filter criteria of {{join this.filterNames ", "}}.
      {{else}}
        No potential Alphas were found for this year.
      {{/if}}
    </b>
  </p>
{{/if}}
```

**Styles**

```scss
// Grouped potentials: a titled block per priority group, each holding its own
// .uf-row-stack. Title is a ~1.3rem semibold heading with a light bottom border.
.uf-row-section {
  margin-bottom: 1.5rem;
}

.uf-row-section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #dcdcdc;
}

// Potential Alphas — Dense Triage / Scan-First rows.
.uf-row-stack {
  margin-top: 0.5rem;
}
```

**Design tokens**

- `font-size: 1.3rem` — section title size (`.uf-row-section-title`)
- `font-weight: 600` (semibold) — section title weight
- `color: #212529` — section title text (Bootstrap near-black/`$gray-900`)
- `margin-bottom: 0.5rem` — gap below title before the row stack
- `padding-bottom: 0.25rem` — space between title text and its underline rule
- `border-bottom: 1px solid #dcdcdc` — light divider under the title
- `margin-bottom: 1.5rem` — vertical separation between the two section blocks (`.uf-row-section`)
- `margin-top: 0.5rem` — top gap inside each `.uf-row-stack` before the first row

**Behavior**

Membership and ordering are computed entirely in the controller (`app/controllers/mentor/potentials.js`). `isPriority(person)` is the single membership rule: returns true if `person.personnel_issue` is set, OR `worstRank(person)` is 3 or 4, OR `mentorBonkYear(person) !== null`. The two group getters derive from it: `priorityPotentials = this.sortedPotentials.filter(isPriority)`; `otherPotentials = this.viewPotentials.filter(p => !isPriority(p))` then `.sort` by callsign only. The deliberate ordering DIFFERENCE: the priority group inherits `sortedPotentials`' worst-first ordering — sort by `severityWeight(b) - severityWeight(a)` descending, tie-broken by callsign `localeCompare` — so the most concerning people surface at the very top; the other group is plain alphabetical by callsign with NO severity ranking, reading as a calm list. `severityWeight` ranks a raised Personnel issue at 100, then `RANK_SEVERITY` maps 4->4, 3->3, 1->2, 2->1, and no-rank to 0 (so worst 4/FLAG and 3/Yellow cluster first). Both blocks are independently conditional on their own `.length`, so a group with zero members renders nothing (no empty header). `viewPotentials` applies the checkbox filters upstream, so both groups reflect the active filter set; the count line above shows "Showing {sortedPotentials.length} of N".

**Accessibility**

Section titles are styled `<div>`s, not semantic headings — they convey hierarchy visually (1.3rem semibold + bottom border) but are not exposed to assistive tech as headings. A re-implementation should consider promoting `.uf-row-section-title` to an `<h2>` (or adding `role="heading" aria-level`) so screen-reader users can navigate the priority vs other partition. The page-level `<h1>` (`{{year}} Potential Alphas`) is the only true heading present. Color is not the sole carrier of the priority distinction — the literal title text "Rank 3/4 or Prior Mentor Bonk" names the rule — and the title color `#212529` on white well exceeds WCAG AA contrast.

**Gotchas**

- The two groups draw from DIFFERENT source arrays: `priorityPotentials` filters the already-sorted `sortedPotentials` (preserving worst-first order), but `otherPotentials` filters raw `viewPotentials` and re-sorts by callsign. Do not refactor both to filter the same array — the ordering divergence is intentional, not an oversight.
- Membership is centralized in `isPriority()` specifically so both getters stay in sync; duplicating the rule inline in each getter would let them drift.
- `RANK_SEVERITY` is non-monotonic with the rank number: 4>3>1>2 (a 1/Green outranks a 2/Normal in severity weight). `worstRank` and `severityWeight` both rely on this map, so '3 or 4' is the priority cutoff but raw numeric comparison of ranks would be wrong.
- `mentorBonkYear` counts ONLY `status === 'bonk'` (mentor-issued), explicitly NOT `'self-bonk'`, and coerces year with `+entry.year` since history years may arrive as strings — a person with a prior mentor bonk is priority even with no current rank/flag.
- Each block is independently wrapped in `{{#if ...length}}`; if every visible person is priority (or every one is non-priority), only one titled section renders and there is no empty counterpart header.
- The empty-state branch distinguishes 'filtered to nothing' (mentees exist) from 'no potentials for the year at all' (no mentees) — preserve both messages when reworking the conditional.
- `key="id"` on the `{{#each}}` is required for stable row identity across the `noteSubmitted` refresh, which swaps a single mentee object in `this.mentees` by id.
- `worstRank` only counts ranks where the underlying entry qualifies (team entries with `rank>0`; trainings require `slot_has_ended && training_rank>0`), so an in-progress training rank will not by itself push someone into the priority group.

**Source**

- [app/templates/mentor/potentials.hbs:50](app/templates/mentor/potentials.hbs#L50)
- [app/templates/mentor/potentials.hbs:72](app/templates/mentor/potentials.hbs#L72)
- [app/controllers/mentor/potentials.js:47](app/controllers/mentor/potentials.js#L47)
- [app/utils/intake-summaries.js:9](app/utils/intake-summaries.js#L9)
- [app/utils/intake-summaries.js:46](app/utils/intake-summaries.js#L46)
- [app/utils/intake-summaries.js:72](app/utils/intake-summaries.js#L72)
- [app/styles/app.scss:679](app/styles/app.scss#L679)
- [app/styles/app.scss:795](app/styles/app.scss#L795)

---

<a id="dense-triage-accordion-row"></a>
### Dense-Triage Accordion Row (PotentialAlphaRow)

![Expanded PotentialAlphaRow showing the severity stripe, identity run, badges, rank chips, and team-partitioned detail](proofshot-artifacts/potentials-expanded.png)

*Screenshot is an illustrative capture.*

**Purpose**

A scan-first triage row that compresses one potential alpha's full intake state into a single severity-striped line, so a reviewer can sweep a long roster worst-first and only spend a click on people who warrant it. Expanding reveals the complete team-partitioned note detail (Personnel / RRN / VC / Training / Mentor) inline so notes are never more than one click away.

**When to use**

Reach for this pattern when you have a long list of heterogeneous records that each carry a worst-case severity and several parallel sub-streams of detail, and the reviewer's job is to triage: the common case is benign (stays one compact line) but every record must be openable in place without leaving the list. The shared `uf-*` / `intake-rank-*` visual language ties it to the Unified Flagging card, so use it whenever you want parity with that flagging surface in a denser, list-oriented form.

**Anatomy**

- `.uf-row` — severity-striped card container (6px color-keyed border-left), gains `.uf-row-expanded` when open
- `.uf-flag-banner` — optional full-bleed red Personnel-flag banner, rendered first only when `@person.personnel_issue`
- `.uf-row-anchor` — the collapsed one-line flex header (always rendered)
- `.uf-row-toggle` — chevron expand/collapse button (`aria-expanded`), first child of the anchor
- `.uf-row-identity` — PersonLink callsign + `<status>` + name + optional gender, inline-flex run
- `.uf-row-badge.uf-row-badge-training` — training-status pill (success/warning/danger)
- `.uf-row-badge` (mentor bonk) — optional danger pill when mentors bonked in a prior year
- `IntakeRankStrip` (`.intake-rank-strip`) — pill chips of recorded ranks, Personnel rank-4 suppressed via `@hidePersonnelFlag`
- `.uf-row-dots` — notes-present digest: one `.uf-row-badge` per stream that has a note, color-keyed to rank
- `.uf-row-detail` (only when expanded) — wraps the team partition
- `.uf-card-teams` -> five `.uf-team` blocks, each with a `.uf-team-label` (Personnel/RRN/VC/Training/Mentor) + an IntakeNotes / IntakeTraining child with its own Add Note/Rank (or View Details) button

**Markup**

```handlebars
{{!-- potential-alpha-row.hbs (verbatim) --}}
<div class="uf-row {{this.severityClass}} {{if this.expanded "uf-row-expanded"}}">
  {{#if @person.personnel_issue}}
    <div class="uf-flag-banner">
      {{fa-icon "ban" right=1}}
      Personnel flag raised on {{@person.callsign}} &mdash; take no actions until resolved
      {{fa-icon "ban" left=1}}
    </div>
  {{/if}}

  <div class="uf-row-anchor">
    <button type="button"
            class="uf-row-toggle"
            aria-expanded="{{if this.expanded "true" "false"}}"
            title="{{if this.expanded "Collapse" "Expand"}} {{@person.callsign}}"
            {{on "click" this.toggle}}>
      {{fa-icon (if this.expanded "chevron-down" "chevron-right")}}
    </button>

    <div class="uf-row-identity">
      <PersonLink @person={{@person}} class="fw-semibold" />
      <span class="uf-card-status">&lt;{{@person.status}}&gt;</span>
      <span class="uf-card-id-sep">&middot;</span>
      <span class="uf-row-name">{{@person.first_name}} {{@person.last_name}}</span>
      {{#if this.genderLabel}}
        <span class="uf-card-id-sep">&middot;</span>
        <span class="uf-row-gender">{{this.genderLabel}}</span>
      {{/if}}
    </div>

    <UiBadge @type={{this.trainingStatus.badgeType}} @text={{this.trainingStatus.text}} class="uf-row-badge uf-row-badge-training" />

    {{#if this.mentorBonk}}
      <UiBadge @type={{this.mentorBonk.badgeType}} @text={{this.mentorBonk.text}} class="uf-row-badge" />
    {{/if}}

    <IntakeRankStrip @person={{@person}} @hidePersonnelFlag={{true}} />

    {{#if this.noteBadges}}
      <div class="uf-row-dots">
        {{#each this.noteBadges as |badge|}}
          <UiBadge @type={{badge.badgeType}} @text={{badge.label}} class="uf-row-badge" />
        {{/each}}
      </div>
    {{/if}}
  </div>

  {{#if this.expanded}}
    <div class="uf-row-detail">
      <div class="uf-card-teams">
        <div class="uf-team">
          <div class="uf-team-label">Personnel</div>
          <IntakeNotes @type="personnel" @person={{@person}} @viewYear={{@year}} @buttonSize="md" @onSubmit={{@onSubmit}} />
        </div>
        <div class="uf-team">
          <div class="uf-team-label">RRN</div>
          <IntakeNotes @type="rrn" @person={{@person}} @viewYear={{@year}} @buttonSize="md" @onSubmit={{@onSubmit}} />
        </div>
        <div class="uf-team">
          <div class="uf-team-label">VC</div>
          <IntakeNotes @type="vc" @person={{@person}} @viewYear={{@year}} @buttonSize="md" @onSubmit={{@onSubmit}} />
        </div>
        <div class="uf-team">
          <div class="uf-team-label">Training</div>
          <IntakeTraining @trainings={{@person.trainings}} @person={{@person}} @buttonSize="md" />
        </div>
        <div class="uf-team">
          <div class="uf-team-label">Mentor</div>
          {{#if @person.mentor_history.length}}
            <div class="uf-row-mentor-history">
              {{#each @person.mentor_history as |history|}}
                <span class="uf-card-pnv-year">
                  <span class="fw-semibold">{{history.year}}</span>
                  {{this.mentorStatusLabel history.status}}
                </span>
              {{/each}}
            </div>
          {{/if}}
          <IntakeNotes @type="mentor" @person={{@person}} @viewYear={{@year}} @buttonSize="md" @onSubmit={{@onSubmit}} />
        </div>
      </div>
    </div>
  {{/if}}
</div>

{{!-- intake-rank-strip.hbs (chip markup, verbatim) --}}
<div class="intake-rank-strip mb-3">
  {{#each this.rankedSummaries key="key" as |team|}}
    <span class="intake-rank-chip intake-rank-chip-rank-{{team.rank}}">
      <span class="intake-rank-chip-value">
        {{#if (eq team.rank 1)}}
          {{fa-icon "award" right=1}}1/Green
        {{else if (eq team.rank 2)}}
          2/Normal
        {{else if (eq team.rank 3)}}
          {{fa-icon "bell" type="r" right=1}}3/Yellow
        {{else if (eq team.rank 4)}}
          {{fa-icon "flag" right=1}}4/FLAG
        {{else}}
          {{team.rank}}/?
        {{/if}}
      </span>
      <span class="intake-rank-chip-sep">&middot;</span>
      <span class="intake-rank-chip-label">{{team.label}} {{team.year}}</span>
    </span>
  {{else}}
    {{#unless @person.personnel_issue}}
      <span class="intake-rank-chip-empty-note">No ranks recorded yet</span>
    {{/unless}}
  {{/each}}
</div>
```

**Styles**

```scss
/* app.scss — uf-row family (~683-819) */
.uf-row {
  position: relative;
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-left: 6px solid #adb5bd;
  border-radius: 6px;
  padding: 0.55rem 0.85rem;
  margin-bottom: 0.5rem;
}
.uf-row-flag   { border-left-color: #dc3545; }
.uf-row-yellow { border-left-color: #9f6800; }
.uf-row-green  { border-left-color: #28a745; }
.uf-row-normal { border-left-color: #adb5bd; }

/* Re-anchor the shared full-bleed Personnel banner to the slimmer row padding. */
.uf-row .uf-flag-banner {
  margin: -0.55rem -0.85rem 0.5rem;
}

/* Collapsed header: everything left-anchored, trailing right space left dead.
   align-items:center only centers each child *box*; the children must also each
   be a centered box of their own so their inner content (toggle SVG, text run,
   pill chips, badges) shares one optical center line. We force every direct
   child to align-self:center and normalize the line-height of the line. */
.uf-row-anchor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.75rem;
  line-height: 1.2;

  > * {
    align-self: center;
  }
}

.uf-row-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  padding: 0 0.25rem;
  line-height: 1.2;
  color: #495057;
  cursor: pointer;
}

.uf-row-identity {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}
.uf-row-name   { color: #212529; }
.uf-row-gender { color: #6c757d; }

/* Re-center the shared rank strip within the collapsed header. It ships with a
   Bootstrap .mb-3 (margin-bottom: 1rem !important) for its standalone use; that
   margin enlarges its flex margin-box and shifts the chips up off the centered
   line, so it must be overridden with !important to beat the utility. */
.uf-row-anchor .intake-rank-strip {
  margin-bottom: 0 !important;
}

/* Notes-present digest: one badge per stream that has a note, colored by rank. */
.uf-row-dots {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

/* Size the badge to read at the same height as a rank chip ... */
.uf-row-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  line-height: 1.2;
  font-weight: 400;
  padding: 0.35rem 0.7rem;
}

/* Training-status badge only: render ~20% smaller than a rank chip / note badge */
.uf-row-badge-training {
  font-size: 0.8rem;
  padding: 0.28rem 0.56rem;
}

/* Expanded detail reuses the unified-flagging team blocks verbatim. */
.uf-row-detail {
  margin-top: 0.5rem;
  padding-top: 0.25rem;
  border-top: 1px solid #f0f0f0;
}
.uf-row-mentor-history { margin-bottom: 0.35rem; }

/* Full-width alarm bleeding to the card edges (~554-567) */
.uf-flag-banner {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 0.5rem;
  margin: -1rem -1.25rem 1rem;
  padding: 0.65rem 1rem;
  background-color: #dc3545;
  color: #ffffff;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: 0px 5px 0 0;
}

/* Team partition (~597-614) */
.uf-card-teams { margin-top: 0.5rem; }
.uf-team {
  padding: 0.6rem 0;
  border-top: 1px solid #f0f0f0;
}
.uf-team:first-child { border-top: 0; }
.uf-team-label {
  font-weight: 600;
  font-size: 1.15rem;
  margin-bottom: 0.25rem;
}

/* Rank chips (~616-668) */
.intake-rank-strip { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.intake-rank-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid;
  border-radius: 999px;
  line-height: 1.2;
  background-color: #ffffff;
}
.intake-rank-chip-label { font-weight: 600; }
.intake-rank-chip-sep   { color: #999999; }
.intake-rank-chip-value { font-weight: 600; }
.intake-rank-chip-rank-1 { border-color: #28a745; background-color: #e8f6ec; color: #1c5b2c; }
.intake-rank-chip-rank-2 { border-color: #6c757d; background-color: #f1f3f5; color: #495057; }
.intake-rank-chip-rank-3 { border-color: #9a9005; background-color: #fff8d7; color: #9f6800; }
.intake-rank-chip-rank-4 { border-color: #dc3545; background-color: #f8d7da; color: #842029; font-weight: 700; }
.intake-rank-chip-empty-note { color: #6c757d; font-style: italic; }
```

**Design tokens**

- Severity stripe width: border-left 6px solid (on `.uf-row`) — color is the only severity signal on the collapsed line
- Stripe / severity colors: flag(rank4) `#dc3545`, yellow(rank3) `#9f6800`, green(rank1) `#28a745`, normal(rank2/none) `#adb5bd`
- Row card: bg `#ffffff`, border 1px solid `#dcdcdc`, border-radius 6px, padding 0.55rem 0.85rem, margin-bottom 0.5rem
- Anchor flex gap: 0.4rem (row) / 0.75rem (column), normalized line-height 1.2
- Personnel banner: bg `#dc3545`, color `#fff`, uppercase, letter-spacing 0.03em, font-weight 500, padding 0.65rem 1rem; full-bleed via negative margin -0.55rem -0.85rem 0.5rem (row override of the card's -1rem -1.25rem 1rem)
- Toggle button: transparent border:0 bg, color `#495057`, padding 0 0.25rem, cursor pointer, chevron-right collapsed / chevron-down expanded
- Identity colors: callsign fw-semibold `#212529`, status `#6c757d`, dot separators `#adb5bd`, last name `#212529`, gender `#6c757d`
- Note/mentor-bonk badge (`.uf-row-badge`): font-size 0.8rem, padding 0.35rem 0.7rem, font-weight 400, line-height 1.2 — sized to match a rank-chip's height
- Training badge (`.uf-row-badge-training`): font-size 0.8rem, padding 0.28rem 0.56rem (~80% of `.uf-row-badge`) so it reads as a secondary status pill
- Rank chip: pill border-radius 999px, padding 0.35rem 0.5rem, gap 0.4rem, 1px border, white base bg, line-height 1.2
- Rank chip color tokens — rank-1 GREEN border `#28a745` / bg `#e8f6ec` / text `#1c5b2c`; rank-2 GREY border `#6c757d` / bg `#f1f3f5` / text `#495057`; rank-3 YELLOW border `#9a9005` / bg `#fff8d7` / text `#9f6800`; rank-4 RED border `#dc3545` / bg `#f8d7da` / text `#842029` (font-weight 700)
- Rank chip icons: 1 award, 3 regular bell, 4 flag; labels '1/Green','2/Normal','3/Yellow','4/FLAG'
- Expanded detail: border-top 1px solid `#f0f0f0`, margin-top 0.5rem, padding-top 0.25rem
- Team block: padding 0.6rem 0, border-top 1px solid `#f0f0f0` (first child border-top 0); label font-weight 600, font-size 1.15rem
- Expanded action buttons request `@buttonSize="md"` (note: IntakeNotes UiButton has both `@size={{noteButtonSize}}` and a later `@size="sm"` — the duplicate sm wins)

**Behavior**

Expand/collapse is local component state: `@tracked userExpanded` (default false), surfaced via the `expanded` getter; `toggle()` flips it. Severity is computed once: `severityClass` returns `'uf-row-flag'` when `person.personnel_issue`, else `uf-row-${severitySlug(worstRank(person))}` (falling back to `'normal'`). `worstRank` uses `RANK_SEVERITY` weighting 4>3>1>2 so the stripe keys to the most-severe rank across all streams. The `IntakeRankStrip` sorts chips by `SORT_ORDER {4:0,3:1,1:2,2:3}` (worst leftmost) and, with `@hidePersonnelFlag={{true}}`, drops the rank-4 Personnel chip (the banner conveys it). The notes-present digest (`noteBadges`) walks `NOTE_STREAMS` [personnel, rrn, vc, mentor] (Training has no note field here) and shows one badge per stream that `teamHasNotes` (some `entry.have_notes`), then applies three filters: (1) omit streams whose rank is 2 OR null (rank-2 'normal/average' is just clutter), (2) omit the Personnel stream when its rank is 4 (banner already shows it). Each surviving badge is color-keyed via `RANK_BADGE_TYPE {flag:danger, yellow:warning, green:success, normal:secondary}`. `trainingStatus`: 'trained'(success) if `person.trained`, else 'training pending'(warning) if any current-year (`@year`) signup with `slot_begins`, else 'no training signup'(danger). `mentorBonk`: a danger '<year> mentor bonked' badge when `mentorBonkYear` finds a prior 'bonk' (not 'self-bonk') status. In the expanded Mentor block, `mentor_history` years are listed with `mentorStatusLabel` (bonk->Bonk, self-bonk->Self-Bonk, pending->Pending, else Pass). Each team's IntakeNotes/IntakeTraining manages its own add/update/delete note state and gates the 'Add Note / Rank' button on session role (mentor->MENTOR, vc->VC, personnel->ADMIN, rrn->REGIONAL_MANAGEMENT, default INTAKE; ADMIN always); when the user lacks the role but notes exist the button label degrades to 'View Details'.

**Accessibility**

The toggle is a real `<button type="button">` with `aria-expanded` bound to the open state ("true"/"false") and a descriptive title ("Expand <callsign>" / "Collapse <callsign>"), so screen readers announce both the control's purpose and its state. Severity is conveyed by the colored left stripe AND redundantly by the rank chips' text labels (1/Green, 3/Yellow, 4/FLAG) plus icons (award/bell/flag) and the explicit Personnel banner text, so meaning is not color-only. The Personnel banner uses high-contrast white-on-`#dc3545` and uppercase emphatic copy. Gaps/considerations: the collapsed-vs-expanded detail is governed only by the `{{#if this.expanded}}` render (no `aria-controls` linking the button to a detail region id, and the detail is added/removed from the DOM rather than toggled via hidden), and the rank chips are presentational spans rather than a list; the chip color contrasts (e.g. rank-3 text `#9f6800` on `#fff8d7`) should be verified against WCAG AA.

**Gotchas**

- Optical-centering gotcha: `align-items:center` on `.uf-row-anchor` only centers each child's margin-box. Heterogeneous children (toggle SVG, text run, pill chips, badges) must ALSO each be a centered box — the rule forces `> * { align-self: center; }` and normalizes the line to line-height:1.2 so every child shares one center line.
- Rank-strip .mb-3 override: IntakeRankStrip ships its root with Bootstrap .mb-3 (margin-bottom:1rem !important) for standalone use. Inside the anchor that bottom margin enlarges its flex margin-box and shoves chips up off the centered line, so `.uf-row-anchor .intake-rank-strip { margin-bottom: 0 !important; }` must use !important to beat the utility.
- Banner is full-bleed via negative margins that must match the container padding. The shared `.uf-flag-banner` uses -1rem -1.25rem (card padding); the row re-anchors it to -0.55rem -0.85rem to match the slimmer `.uf-row` padding — change the row padding and you must change this too or the banner won't bleed flush.
- Notes-present badges intentionally omit rank-2 and null-rank streams, AND omit Personnel when rank is 4 (the banner conveys it). A reviewer scanning dots will NOT see a 'Personnel Note' dot on a flagged person — that is by design, not a bug.
- Rank-strip chip suppression and stripe/banner are three separate suppressions of the same rank-4 Personnel fact: the stripe turns red (`personnel_issue`), the banner renders, the rank chip is hidden (`@hidePersonnelFlag`), and the note dot is filtered out. All four must stay in sync.
- `worstRank` severity ordering is NOT numeric: `RANK_SEVERITY` maps 4>3>1>2, so rank 1 (Green) outranks rank 2 (Normal) for stripe color. Don't assume higher number = worse across the board.
- `NOTE_STREAMS` in this component (4 entries, no Training) differs from `INTAKE_TEAMS` in intake-summaries (5 entries, includes Training with field:null) — Training has no note stream here, only a rank, so it never produces a note dot.
- IntakeNotes' UiButton passes `@size` twice (`@size={{this.noteButtonSize}}` then `@size="sm"`); the trailing `@size="sm"` wins, so the `@buttonSize="md"` the row requests does not actually enlarge the IntakeNotes button.
- The Training team block uses IntakeTraining (which has its own 'View Training Details' modal), not IntakeNotes — its button/notes behavior is different from the other four streams.
- `expanded` is purely local per-row state; there is no expand-all/collapse-all and no persistence, so re-rendering the list resets every row to collapsed.

**Source**

- [app/components/potential-alpha-row.hbs:1](app/components/potential-alpha-row.hbs#L1)
- [app/components/potential-alpha-row.js:9](app/components/potential-alpha-row.js#L9) (NOTE_STREAMS, RANK_BADGE_TYPE)
- [app/components/potential-alpha-row.js:36](app/components/potential-alpha-row.js#L36) (severityClass)
- [app/components/potential-alpha-row.js:43](app/components/potential-alpha-row.js#L43) (expanded/toggle)
- [app/components/potential-alpha-row.js:70](app/components/potential-alpha-row.js#L70) (noteBadges rules)
- [app/components/potential-alpha-row.js:85](app/components/potential-alpha-row.js#L85) (mentorBonk, trainingStatus)
- [app/components/intake-rank-strip.js:5](app/components/intake-rank-strip.js#L5) (SORT_ORDER, hidePersonnelFlag)
- [app/components/intake-rank-strip.hbs:1](app/components/intake-rank-strip.hbs#L1) (chip markup + rank labels/icons)
- [app/components/intake-notes.hbs:1](app/components/intake-notes.hbs#L1)
- [app/components/intake-notes.js:25](app/components/intake-notes.js#L25) (noteButtonSize, canAddNote roles)
- [app/components/intake-training.hbs:1](app/components/intake-training.hbs#L1)
- [app/utils/intake-summaries.js:1](app/utils/intake-summaries.js#L1) (INTAKE_TEAMS, RANK_SEVERITY, worstRank, severitySlug, mentorBonkYear)
- [app/styles/app.scss:554](app/styles/app.scss#L554) (.uf-flag-banner)
- [app/styles/app.scss:597](app/styles/app.scss#L597) (.uf-card-teams/.uf-team/.uf-team-label)
- [app/styles/app.scss:616](app/styles/app.scss#L616) (.intake-rank-chip + rank-1..4)
- [app/styles/app.scss:683](app/styles/app.scss#L683) (.uf-row family, anchor, toggle, dots, badges, detail)
- [proofshot-artifacts/potentials-expanded.png](proofshot-artifacts/potentials-expanded.png)

---

## Shared visual language

These four patterns are deliberately built from one shared vocabulary — reuse it so future triage surfaces stay consistent:

- **The rank color scale (green / grey / yellow / red).** Rank 1/Green `#28a745`, rank 2/Normal grey `#adb5bd`/`#6c757d`, rank 3/Yellow `#9f6800`, rank 4/FLAG red `#dc3545` recur across the rank chips, the row severity stripes, and the note-digest badges. The same amber `#9f6800` that flags "granted, no shift worked" in the Roster Legend is the yellow/rank-3 hue in the Potential Alphas chips — one warning color, used everywhere.
- **Tinted-card-with-left-accent treatment.** The Roster Legend (`#f8f9fa` card, 3px `#6c757d` left rail) and the info-note left border (`#dee2e6`) read as the same family as the Roster Controls Bar (`#f0f2f5` card, `#dee2e6` border). A subtle grey tint plus a flush square left edge signals "explanatory band above the data."
- **Severity left-stripes.** The 6px color-keyed `border-left` on `.uf-row` carries worst-first meaning at a glance and keys to the rank scale above. It is the list-row analogue of the legend's accent rail — a colored vertical rail is the recurring "this is keyed to a status" cue.
- **Pill / badge sizing.** Rounded pills (rank chips at `border-radius:999px`, count pill at `0.25rem`) and the `~0.8rem` badge font with `~0.35rem 0.7rem` padding give every status token a consistent optical height so they line up on a centered flex row. Secondary tokens (the training badge) drop to ~80% padding to read as subordinate. Keep new status tokens within this sizing band so they share the same baseline.
