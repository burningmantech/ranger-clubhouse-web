import Component from '@glimmer/component';
import { summarizeTeams } from 'clubhouse/utils/intake-summaries';

// Lower number = higher visual priority (renders leftmost).
const SORT_ORDER = { 4: 0, 3: 1, 1: 2, 2: 3 };

export default class IntakeRankStripComponent extends Component {
  get rankedSummaries() {
    return summarizeTeams(this.args.person)
      .filter((t) => t.rank)
      .sort((a, b) => SORT_ORDER[a.rank] - SORT_ORDER[b.rank]);
  }

  get hasNoRanks() {
    return this.rankedSummaries.length === 0;
  }
}
