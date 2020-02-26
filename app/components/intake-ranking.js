import Component from '@glimmer/component';

const RANKING_LABELS = {
  1: { text: 'Green' },
  2: { text: 'White' },
  3: { text: 'Yellow' },
  4: { text: 'FLAG' } // color handled within template
};

export default class IntakeRankingComponent extends Component {
  constructor() {
    super(...arguments);

    this.rank = +this.args.rank;
    if (this.rank == 0) {
      this.rank = null;
    }
  }

  get rankingText() {
    const rank = this.rank;
    const label = RANKING_LABELS[rank];

    if (rank == 2) {
      return 'Normal';
    }

    if (label) {
      return `${rank} (${label.text})`;
    }
    return `${rank} (Unknown)`;

  }
}
