import Component from '@glimmer/component';

export default class SurveyTrainerRatingLineComponent extends Component {
  constructor() {
    super(...arguments);

    this.line = this.args.responses[this.args.code];
    if (!this.rating) {
      this.rating = {
        mean: 0, rating_count: 0, rating: 0
      }
    }
  }
}
