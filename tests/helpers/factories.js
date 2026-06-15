/**
 * Shared, plain-object test data builders.
 *
 * These centralize the copy-pasted POJO fixtures that were duplicated (and
 * frequently malformed) across the integration component tests. Each builder
 * returns the shape the component-under-test actually consumes, and accepts an
 * `overrides` object so individual tests vary only what they care about.
 *
 * For Ember Data / Mirage-backed data use the store or `this.server`; these
 * builders are for the lightweight POJOs that components accept as `@args`.
 */

/** A person POJO with the fields components commonly read. */
export function makePerson(overrides = {}) {
  return {id: 1234, callsign: 'Hubcap', status: 'active', ...overrides};
}

/**
 * Intake team-notes in the shape the intake-note(s) components iterate over:
 *
 *   person[`${type}_team`] => [{ year, rank, have_notes, notes: [{...}] }]
 *
 * `have_notes`/`is_log` matter: intake-notes only renders note text when
 * `have_notes` is true and the note is not a log entry.
 */
export function makeTeamNotes({year = 2020, rank = 2, notes} = {}) {
  return [
    {
      year,
      rank,
      have_notes: true,
      notes: notes ?? [
        {
          id: 1,
          note: 'A note',
          is_log: false,
          created_at: '2020-01-01 12:34:56',
          person_source: {id: 9999, callsign: 'Bucket'},
        },
      ],
    },
  ];
}
