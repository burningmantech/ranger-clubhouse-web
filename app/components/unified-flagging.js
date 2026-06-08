import Component from '@glimmer/component';
import {action} from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { severityWeight, worstRank, mentorBonkYear } from 'clubhouse/utils/intake-summaries';

export default class UnifiedFlaggingComponent extends Component {
  queryParams=['year'];
  @service ajax;
  @service house;

  // Locally-merged note/history updates, keyed by person id. Kept separate from
  // @args.people so the list stays reactive: when the parent re-filters and
  // passes a new @people array, we re-derive from it rather than rendering a
  // stale constructor snapshot.
  @tracked noteOverrides = new Map();

  get people() {
    const overrides = this.noteOverrides;
    if (overrides.size === 0) {
      return this.args.people;
    }
    return this.args.people.map((person) => overrides.get(person.id) ?? person);
  }

  // Worst-first so Personnel flags and Rank 4/3 concerns sort to the top, with
  // callsign as a stable tiebreak (matching the potentials controller).
  get sortedPeople() {
    return this.people.slice().sort((a, b) => {
      const weight = severityWeight(b) - severityWeight(a);
      if (weight !== 0) {
        return weight;
      }
      return (a.callsign ?? '').localeCompare(b.callsign ?? '');
    });
  }

  // Every person on this page is already flagged, so the potentials
  // priority-vs-benign split does not apply. Instead quarantine the raised
  // Personnel flags at the top ("take no actions until resolved"), separate
  // from the rank/bonk concerns a VC can act on. Both groups keep worst-first
  // ordering.
  get personnelFlaggedPeople() {
    return this.sortedPeople.filter((person) => person.personnel_issue);
  }

  // Single source of truth for the priority split among NON-personnel people:
  // worst team rank is 3 or 4, OR mentors previously bonked them. Centralized
  // here so rankFlaggedPeople and otherPeople cannot drift apart.
  isRankOrBonk = (person) => {
    const worst = worstRank(person);
    return worst === 3 || worst === 4 || mentorBonkYear(person) !== null;
  };

  // Non-personnel people who are rank 3/4 or were mentor-bonked. Per an explicit
  // product decision this section is sorted alphabetically by callsign (rank 3/4
  // and bonk-only people fully intermixed), deliberately dropping worst-first
  // ordering here only. Derived from this.people (not sortedPeople) so severity
  // order is not pre-imposed; .filter() yields a fresh array so this.people is
  // not mutated by the sort.
  get rankFlaggedPeople() {
    return this.people
      .filter((person) => !person.personnel_issue && this.isRankOrBonk(person))
      .sort((a, b) => (a.callsign ?? '').localeCompare(b.callsign ?? ''));
  }

  // Everyone else: non-personnel, not rank 3/4, never mentor-bonked. Unlike the
  // priority groups this reads as a calm list, so it is sorted alphabetically by
  // callsign rather than worst-first. Derived from this.people (not sortedPeople)
  // to keep reactivity while applying its own ordering.
  get otherPeople() {
    return this.people
      .filter((person) => !person.personnel_issue && !this.isRankOrBonk(person))
      .sort((a, b) => (a.callsign ?? '').localeCompare(b.callsign ?? ''));
  }

  // Refresh a single person's note/team history after a note is saved. The
  // history endpoint returns an intake-shaped person, so we MERGE it over the
  // existing record rather than replacing it: that keeps feed-specific fields
  // the response omits (e.g. the mentees-feed gender_identity/gender_custom used
  // by /mentor/potentials) while taking the fresh team/note data. For the
  // intake-shaped VC/Training feeds the merge is equivalent to a replace.
  @action
  async noteSubmitted(person) {
    try {
      const result = await this.ajax.request(`intake/${person.id}/history`, {method: 'GET', data: {year: this.args.year}});
      const next = new Map(this.noteOverrides);
      next.set(person.id, {...person, ...result.person});
      this.noteOverrides = next;
    } catch (response) {
      return this.house.handleErrorResponse(response);
    }
  }
}
