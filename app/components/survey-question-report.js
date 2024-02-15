import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {TYPE_ALPHA} from "clubhouse/models/survey";

export default class SurveyQuestionReportComponent extends Component {
  constructor() {
    super(...arguments);
    this.isAlphaSurvey = this.args.survey.type === TYPE_ALPHA;
  }

  @action
  showPersonAnswerAction(answer, event) {
    event.preventDefault();
    set(answer, 'showPerson', true);
  }

  progressValue(mean) {
    if (!mean) {
      return 0;
    }

    return Math.floor((mean / 7.0) * 100);
  }
}
