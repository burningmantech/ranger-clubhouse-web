import Component from '@glimmer/component';
import { summarizeTeams } from 'clubhouse/utils/intake-summaries';

// Lower number = higher visual priority (renders leftmost).
const SORT_ORDER = { 4: 0, 3: 1, 1: 2, 2: 3 };

export default class IntakeRankStripComponent extends Component {
  get rankedSummaries() {
    let summaries = summarizeTeams(this.args.person).filter((t) => t.rank);

    // Callers (e.g. the potentials rows) may suppress the rank-4 Personnel chip
    // because a full-width Personnel flag banner already conveys it. Opt-in.
    if (this.args.hidePersonnelFlag) {
      summaries = summaries.filter((t) => !(t.key === 'personnel' && t.rank === 4));
    }

    return summaries.sort((a, b) => SORT_ORDER[a.rank] - SORT_ORDER[b.rank]);
  }

  get hasNoRanks() {
    return this.rankedSummaries.length === 0;
  }
}
