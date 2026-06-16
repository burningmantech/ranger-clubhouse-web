import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {cached,tracked} from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';

// Alpha-signup chip states (mentors-based "walked" signal — see PLAN-2 §3).
const ALPHA_STATES = {
  'none':         {color: 'warning', label: 'no signup'},
  'did-not-walk': {color: 'warning', label: "signed up, didn't walk"},
  'walked':       {color: 'success', label: 'walked'},
};

// Single-select facet dropdowns. Each option set is mutually exclusive given the
// data, so a compact <select> replaces the old checkbox row. '' = no constraint.
const SignupOptions = [
  {id: '', title: 'Signup: all'},
  {id: 'none', title: 'No signup'},
  {id: 'signed-up', title: 'Signed up'},
  {id: 'walked', title: 'Walked'},
];
const StatusOptions = [
  {id: '', title: 'Status: all'},
  {id: 'bonk', title: 'Bonked'},
  {id: 'self-bonk', title: 'Self-bonk'},
  {id: 'uber-bonk', title: 'Uber-bonk'},
];
const RankOptions = [
  {id: '', title: 'Rank: all'},
  {id: 'none', title: 'No rank'},
  {id: '1', title: 'Rank 1'},
  {id: '2', title: 'Rank 2'},
  {id: '3', title: 'Rank 3'},
  {id: '4', title: 'Rank 4'},
];
const NotesOptions = [
  {id: '', title: 'Notes: all'},
  {id: 'any', title: 'Has mentor notes'},
  {id: 'none', title: 'No notes'},
];

export default class MentorPostSeasonSummaryController extends ClubhouseController {
  queryParams = ['year'];

  @tracked mentees;
  @tracked callsignFilter = '';

  // Single-select facet filters. '' = no constraint.
  @tracked signupFilter = '';
  @tracked statusFilter = '';
  @tracked rankFilter = '';
  @tracked notesFilter = '';

  // Mentor multi-select (array of selected mentor ids, as strings from the DOM).
  @tracked selectedMentorIds = [];

  signupOptions = SignupOptions;
  statusOptions = StatusOptions;
  rankOptions = RankOptions;
  notesOptions = NotesOptions;

  _nornalizeCallsign(callsign) {
    return callsign?.trim().toLowerCase().replace(' ', '');
  }

  // The viewed-year mentor_team entry for a mentee (loose == because the
  // mentor_team year arrives as a string groupBy key). PLAN-2 §6.2.
  _viewYearEntry(m) {
    return m.mentor_team?.find((x) => x.year == this.year);
  }

  // Deduped, callsign-sorted mentor options for the multi-select. PLAN-2 §6.5.2.
  @cached
  get mentorOptions() {
    const byId = new Map();
    (this.mentees ?? []).forEach((m) => {
      (m.mentors ?? []).forEach((mentor) => {
        if (!byId.has(mentor.id)) {
          byId.set(mentor.id, {id: mentor.id, title: mentor.callsign});
        }
      });
    });

    return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title, undefined, {sensitivity: 'base'}));
  }

  @cached
  get filteredMentees() {
    let mentees = this.mentees;

    if (!isEmpty(this.callsignFilter)) {
      const callsign = this._nornalizeCallsign(this.callsignFilter);

      mentees = mentees.filter((m) => {
        if (this._nornalizeCallsign(m.callsign).indexOf(callsign) !== -1) {
          return true;
        }

        let found = false;
        m.fkas?.forEach((name) => {
          if (this._nornalizeCallsign(name).indexOf(callsign) !== -1) {
            found = true;
          }
        });

        return found;
      })
    }

    // Single-select facets: each AND-narrows; '' imposes no constraint.

    // SIGNUP
    switch (this.signupFilter) {
      case 'none':      mentees = mentees.filter((m) => !m.alpha_slots); break;
      case 'signed-up': mentees = mentees.filter((m) => !!m.alpha_slots); break;
      case 'walked':    mentees = mentees.filter((m) => !!m.alpha_slots && m.mentors?.length > 0); break;
    }

    // STATUS
    switch (this.statusFilter) {
      case 'bonk':      mentees = mentees.filter((m) => m.mentor_status === 'bonk'); break;
      case 'self-bonk': mentees = mentees.filter((m) => m.mentor_status === 'self-bonk'); break;
      case 'uber-bonk': mentees = mentees.filter((m) => m.status === 'uberbonked'); break;
    }

    // RANK
    if (this.rankFilter) {
      mentees = mentees.filter((m) => {
        const e = this._viewYearEntry(m);
        const rank = e ? +e.rank : 0;
        return this.rankFilter === 'none' ? (!e || rank === 0) : (!!e && rank === +this.rankFilter);
      });
    }

    // NOTES
    switch (this.notesFilter) {
      case 'any':  mentees = mentees.filter((m) => this._viewYearEntry(m)?.have_notes === true); break;
      case 'none': mentees = mentees.filter((m) => !this._viewYearEntry(m)?.have_notes); break;
    }

    // MENTOR multi-select. Empty selection imposes no constraint (PLAN-2 §6.2).
    if (this.selectedMentorIds.length > 0) {
      const selected = new Set(this.selectedMentorIds.map((id) => `${id}`));
      mentees = mentees.filter((m) => m.mentors?.some((mt) => selected.has(`${mt.id}`)));
    }

    return mentees;
  }

  @cached
  get flaggedMentees() {
    return this.filteredMentees.filter((m) => m.isFlagged);
  }

  @cached
  get otherMentees() {
    return this.filteredMentees.filter((m) => !m.isFlagged);
  }

  @cached
  get filterNames() {
    const names = [];
    const titleFor = (opts, val) => opts.find((o) => o.id === val)?.title;

    if (this.signupFilter) names.push(titleFor(SignupOptions, this.signupFilter));
    if (this.statusFilter) names.push(titleFor(StatusOptions, this.statusFilter));
    if (this.rankFilter) names.push(titleFor(RankOptions, this.rankFilter));
    if (this.notesFilter) names.push(titleFor(NotesOptions, this.notesFilter));
    if (this.selectedMentorIds.length > 0) names.push('Mentor');

    return names;
  }

  setupMentees() {
    const year = this.year;
    this.mentees.forEach((m) => {
      let mentorStatus = 'pending';
      m.mentor_history.forEach((h) => {
        if (h.year == year) {
          mentorStatus = h.status;
          set(m, 'mentors', h.mentors);
        }
      });
      set(m, 'mentor_status', mentorStatus);

      // Derived annotations — computed AFTER `mentors` is set (PLAN-2 §3 dep note).

      // Alpha-signup chip state (PLAN-2 §3).
      let alphaState;
      if (!m.alpha_slots) {
        alphaState = 'none';
      } else if (m.mentors?.length > 0) {
        alphaState = 'walked';
      } else {
        alphaState = 'did-not-walk';
      }
      set(m, 'alphaState', alphaState);
      set(m, 'alphaColor', ALPHA_STATES[alphaState].color);
      set(m, 'alphaLabel', ALPHA_STATES[alphaState].label);

      // Mentor rank 3/4 chip — viewed-year, mentor-only (PLAN-2 §4).
      const entry = this._viewYearEntry(m);
      const mentorRank = entry ? +entry.rank : 0;
      set(m, 'mentorRank', mentorRank);
      set(m, 'mentorRankFlagged', mentorRank === 3 || mentorRank === 4);

      // Section A membership predicate (PLAN-2 §5).
      set(m, 'isFlagged',
        mentorStatus === 'bonk'
        || mentorStatus === 'self-bonk'
        || m.status === 'uberbonked'
        || mentorRank === 3 || mentorRank === 4);
    });
  }

  @action
  updateSelectedMentorIds(ids) {
    this.selectedMentorIds = ids;
  }

  @action
  async noteSubmitted(person) {
    // Refresh the potentials
    try {
      const {mentee} = await this.ajax.request('mentor/mentees', {data: {year: this.year, person_id: person.id}});
      this.mentees = this.mentees.map((m) => m.id == person.id ? mentee : m);
      this.setupMentees();
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }
}
