# Ranger Clubhouse — web

Ember.js front-end for the Black Rock Rangers Clubhouse: people, timesheets, shift
slots, positions, BMIDs, access documents, and HQ-window operations. This file is
the shared vocabulary; the architecture review (`/improve-codebase-architecture`)
and grilling skills use these terms instead of drifting to synonyms.

## Write path

Two seams persist changes to the API. Pick by **shape of the thing being saved**.

**Record save** _(the `save-model` service)_:
The one place an Ember Data record **or** an ember-changeset is persisted —
owns the `save → success-toast → error → rollback` choreography and an optional
double-submit guard, returning a boolean so callers branch with `if (await save)`.
_Avoid_: `house.saveModel`, `saveWithRollback`, hand-rolled `model.save().then/catch`.

**Command** _(the `command` service — generalised from `hq-action`)_:
A server action invoked by `POST` that returns a `status` + data rather than a
saved record (e.g. shift sign-in, create-alpha-set). Dispatches on `result.status`
to caller-supplied handlers.
_Avoid_: `hq-action`, `ajax.post`-with-toast-and-error re-typed inline.
_Scope_: deliberately narrow — fits a **single POST → switch(status) → handler**.
Sites that loop saves, mutate `result` before the switch, push a payload, use a
non-POST verb, or need a custom `catch` (e.g. an error dialog) stay hand-rolled;
forcing them through the seam costs more readability than the seam buys. A sweep
was triaged and rejected on these grounds — don't re-propose routing all POSTs
through `command`.

**isSubmitting guard**:
The optional `owner` passed to a seam — a controller/component exposing a tracked
`isSubmitting`. The seam flips it around the save. Omit `owner` when a caller owns
a differently-named guard (e.g. `pendingEntry`).

## Cross-cutting modules (the `house` split)

The legacy `house` service is a grab-bag; it is being split into narrow modules so
an `@service` name states its own leverage. Use the target name, not `house`.

**errors**: maps an API failure to user-facing display, and field errors back onto
a changeset. The one deep module here. _Avoid_: `house` (for error handling).
**download**: CSV / file / URL downloads. _Avoid_: `house.downloadCsv`.
**scroll**: page scroll + accordion control. _Avoid_: `house.scrollTo*`.
**storage**: localStorage get/set/clear. _Avoid_: `house.getKey`.
**store-payload**: push a raw API payload into the Ember Data store.
**analytics**: record a user action event. _Avoid_: `house.actionRecord`.
**browser**: clipboard + script loading. _Avoid_: `house.copyToClipboard`.

## View modules

Deep, render-free modules that take raw data and return the rows/options a fat
view-controller used to compute inline. Tested with plain data, like `handle-rules`.

**BMID view**: filters + sorts + builds filter-options for the BMID roster.
**Access Document Export** (`access-document-export`): delivery-type rules + TRS
columns + CSV format for the access-document export. _Avoid_: export logic inline
in the `trs` controller.
**Slots view** (`slots-view`): filters + sorts the slot list. Shares the
filter→sort *shape* with **BMID view** (`bmid-view`), but a shared `filtered-view`
seam was declined now that both exist — the common surface is just Array
filter/sort over entirely different fields, so the abstraction wouldn't pay.
Don't re-propose it.
