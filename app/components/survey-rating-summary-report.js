import Component from '@glimmer/component';
import { TYPE_NORMAL, TYPE_TRAINER } from 'clubhouse/models/survey-group';

export default class SurveyRatingSummaryReportComponent extends Component {
  constructor() {
    super(...arguments);

    const {report, summary} = this.args;
    const {type} = report;
    this.isNormal = (type === TYPE_NORMAL);
    this.isTrainer = (type === TYPE_TRAINER);

    if (this.isNormal) {
      this.ratings = summary.slots;
    } else if (this.isTrainer) {
      this.ratings = summary.trainers;
    }

    if (this.ratings) {
      this.ratings.forEach((r) => r.mean = r.mean.toFixed(1));
    }
  }
}
