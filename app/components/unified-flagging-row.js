import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';
import { severitySlug, summarizeTeams, worstRank } from 'clubhouse/utils/intake-summaries';
import { GENDER_CUSTOM, GenderIdentityLabels } from 'clubhouse/models/person';

// The note streams summarized as badges on the collapsed row. Order mirrors
// the expanded team layout for parity. Training is excluded from the digest
// because its detail lives in IntakeTraining, not an IntakeNotes stream.
const NOTE_STREAMS = [
  { key: 'personnel', label: 'Personnel', field: 'personnel_team' },
  { key: 'rrn',       label: 'RRN',       field: 'rrn_team' },
  { key: 'vc',        label: 'VC',        field: 'vc_team' },
  { key: 'mentor',    label: 'Mentor',    field: 'mentor_team' },
];

// Severity slug -> Bootstrap badge color, so a note badge carries its rank.
const RANK_BADGE_TYPE = {
  flag: 'danger',
  yellow: 'warning',
  green: 'success',
  normal: 'secondary',
};

// Dense Triage / Scan-First row for a single flagged Prospective or Alpha on
// /vc/unified-flagging. Collapsed it is a one-line summary (severity stripe +
// identity + FKA hint + training-status & mentor-bonk badges + rank chips +
// notes-present badges); expanded it shows the per-year PNV history and the
// five team note streams.
// Tailored to the intake-endpoint person shape (formerly_known_as, pnv_history,
// trainings): the mentor-bonk badge is derived from pnv_history rather than the
// mentees-only mentor_history array. Gender is shown only when @showGender is
// passed (mentor/potentials); it stays hidden on VC and Training.
export default class UnifiedFlaggingRowComponent extends Component {
  @tracked userExpanded = false;

  @cached
  get worst() {
    return worstRank(this.args.person);
  }

  // Severity drives the left stripe color so the list scans at a glance. A
  // raised Personnel flag always wins.
  get severityClass() {
    if (this.args.person.personnel_issue) {
      return 'uf-row-flag';
    }
    return `uf-row-${severitySlug(this.worst) ?? 'normal'}`;
  }

  get expanded() {
    return this.userExpanded;
  }

  // The gender label for the collapsed anchor, gated behind @showGender so it
  // only appears on mentor/potentials. A custom identity shows the free-text
  // value, otherwise the labeled value with a raw fallback. Returns null (chip
  // hidden) unless showGender is set.
  get genderLabel() {
    if (!this.args.showGender) {
      return null;
    }
    const person = this.args.person;
    if (person.gender_identity === GENDER_CUSTOM) {
      return person.gender_custom;
    }
    return GenderIdentityLabels[person.gender_identity] ?? person.gender_identity;
  }

  // A short comma-joined FKA hint for the collapsed anchor, or null when none.
  get fkaHint() {
    const fka = this.args.person.formerly_known_as;
    if (!Array.isArray(fka) || fka.length === 0) {
      return null;
    }
    return fka.join(', ');
  }

  // PNV history is keyed by year; present it newest-first for the expanded view.
  get sortedPnvHistory() {
    const history = this.args.person.pnv_history;
    if (!history) {
      return [];
    }
    return Object.keys(history)
      .sort((a, b) => b - a)
      .map((year) => ({ year, info: history[year] }));
  }

  // The rank recorded for each team, keyed by team — used to color the dots.
  @cached
  get rankByTeam() {
    const map = {};
    for (const team of summarizeTeams(this.args.person)) {
      map[team.key] = team.rank;
    }
    return map;
  }

  // One badge per stream that actually has a note, color-keyed to that stream's
  // rank. Rank-2 ("normal/average") streams are omitted so they don't clutter
  // the anchor; a rank-4 Personnel note is also omitted because the full-width
  // Personnel flag banner already conveys it.
  get noteBadges() {
    const person = this.args.person;
    const ranks = this.rankByTeam;
    return NOTE_STREAMS
      .filter((stream) => this.teamHasNotes(person[stream.field]))
      .filter((stream) => ranks[stream.key] !== 2 && ranks[stream.key] !== null)
      .filter((stream) => !(stream.key === 'personnel' && ranks[stream.key] === 4))
      .map((stream) => {
        const slug = severitySlug(ranks[stream.key]) ?? 'normal';
        return { label: `${stream.label} Note`, badgeType: RANK_BADGE_TYPE[slug] };
      });
  }

  // A full-size danger badge when this person was bonked (mentor or self) in any
  // year, derived from pnv_history — the intake person has no mentor_history
  // array, so the shared mentorBonkYear util does not apply. Shows the most
  // recent bonk, immediately right of the training-status badge.
  @cached
  get mentorBonk() {
    const history = this.args.person.pnv_history;
    if (!history) {
      return null;
    }
    let latestYear = null, latestStatus = null;
    for (const year of Object.keys(history)) {
      const status = history[year]?.mentor_status;
      if (status === 'bonk' || status === 'self-bonk') {
        const numericYear = +year;
        if (latestYear === null || numericYear > latestYear) {
          latestYear = numericYear;
          latestStatus = status;
        }
      }
    }
    if (latestYear === null) {
      return null;
    }
    const text = latestStatus === 'self-bonk' ? `${latestYear} self-bonked` : `${latestYear} mentor bonked`;
    return { text, badgeType: 'danger' };
  }

  // Current-year (@year) training status as a single badge before the rank
  // chips. Derived from the trainings list: a passed current-year training
  // reads "trained", any other current-year signup "training pending", and no
  // current-year signup "no training signup".
  get trainingStatus() {
    const trainings = this.args.person.trainings;
    const thisYear = (Array.isArray(trainings) ? trainings : []).filter(
      (training) => training.slot_begins
        && new Date(training.slot_begins).getFullYear() === this.args.year
    );
    if (thisYear.some((training) => training.slot_has_ended && training.training_passed)) {
      return { text: 'trained', badgeType: 'success' };
    }
    if (thisYear.length) {
      return { text: 'training pending', badgeType: 'warning' };
    }
    return { text: 'no training signup', badgeType: 'danger' };
  }

  teamHasNotes(team) {
    return Array.isArray(team) && team.some((entry) => entry.have_notes);
  }

  @action
  toggle() {
    this.userExpanded = !this.expanded;
  }
}
