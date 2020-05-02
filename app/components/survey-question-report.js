import Component from '@glimmer/component';
import { action, set } from '@ember/object';

export default class SurveyQuestionReportComponent extends Component {
  constructor() {
    super(...arguments);

    this.question = this.args.responses[this.args.code];
    const question = this.question;

    if (!question) {
      return;
    }

    if (this.args.isSlotRating) {
      this.slotRatings = question.slots;
      // Sort descending
      this.slotRatings.sort((a, b) => {
        const diff = b.mean - a.mean;
        if (diff == 0) {
          return b.rating_count - a.rating_count;
        } else {
          return diff;
        }
      });
      this.slotRatings.forEach((s) => {
        s.mean = s.mean.toFixed(1);
        s.variance = s.variance.toFixed(1);
      });
    }

    if (question.type == 'rating') {
      question.mean = question.mean.toFixed(1);
      question.variance = question.variance.toFixed(1);
    }
  }

  @action
  showPersonAnswerAction(answer, event)
  {
    event.preventDefault();
    set(answer, 'showPerson', true);
  }
}
