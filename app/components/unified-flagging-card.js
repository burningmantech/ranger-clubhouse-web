import Component from '@glimmer/component';
import { severitySlug, worstRank } from 'clubhouse/utils/intake-summaries';

export default class UnifiedFlaggingCardComponent extends Component {
  // Severity drives the card's left edge color so the list scans at a glance.
  get severityClass() {
    if (this.args.person.personnel_issue) {
      return 'uf-card-flag';
    }
    const slug = severitySlug(worstRank(this.args.person));
    return `uf-card-${slug ?? 'normal'}`;
  }

  // PNV history is keyed by year; present it newest-first.
  get sortedPnvHistory() {
    const history = this.args.person.pnv_history;
    if (!history) {
      return [];
    }
    return Object.keys(history)
      .sort((a, b) => b - a)
      .map((year) => ({year, info: history[year]}));
  }
}
