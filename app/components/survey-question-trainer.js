import Component from '@glimmer/component';

export default class SurveyQuestionTrainerComponent extends Component {
  constructor() {
    super(...arguments);

    this.question = this.args.responses[this.args.code];
  }
}
