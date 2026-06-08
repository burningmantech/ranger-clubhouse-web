import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

// Adapt a mentees-feed person to the shape <UnifiedFlaggingRow> expects (which
// was tailored to the intake-endpoint person). Two fields differ:
//  - the row reads `formerly_known_as` (array); the mentees feed provides `fkas`.
//  - the row derives its mentor-bonk badge and expanded per-year history from
//    `pnv_history` (object keyed by year -> { mentor_status }); the mentees feed
//    provides `mentor_history` (array of { year, status }).
// Additive only — every other field the row consumes is already present.
function normalizeMentee(mentee) {
  const pnvHistory = {};
  if (Array.isArray(mentee.mentor_history)) {
    for (const entry of mentee.mentor_history) {
      if (entry && entry.year != null) {
        pnvHistory[entry.year] = { mentor_status: entry.status };
      }
    }
  }

  return {
    ...mentee,
    formerly_known_as: mentee.fkas,
    pnv_history: pnvHistory,
  };
}

export default class MentorPotentialsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/mentees', { data: { have_training: 1 }});
  }

  setupController(controller, model) {
    controller.set('mentees', model.mentees.map(normalizeMentee));
    controller.set('year', this.house.currentYear());
    controller.set('filter', 'all');
  }
}
