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
}
