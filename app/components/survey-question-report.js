import Component from '@glimmer/component';
import { action, set } from '@ember/object';

export default class SurveyQuestionReportComponent extends Component {
  constructor() {
    super(...arguments);
  }

  @action
  showPersonAnswerAction(answer, event)
  {
    event.preventDefault();
    set(answer, 'showPerson', true);
  }

  progressValue(mean) {
    if (!mean) {
      return 0;
    }

    return Math.floor((mean / 7.0)*100);
  }
}
