import Component from '@glimmer/component';

export default class SurveyQuestionReportComponent extends Component {
   progressValue(mean) {
    if (!mean) {
      return 0;
    }

    return Math.floor((mean / 7.0) * 100);
  }
}
