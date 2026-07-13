import Component from '@glimmer/component';
import {WHY_VOLUNTEER_REVIEW_OKAY} from "clubhouse/models/prospective-application";
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';


export default class VcApplicationDetailsComponent extends Component {
  @service session;
  @service saveModel;

  @tracked isSubmitting;

  @tracked showProblemReviewDialog;

  @cached
  get eventYearOptions() {
    const years = [];
    for (let i = 1986; i <= this.session.currentYear(); i++) {
      years.push(i);
    }

    return years;
  }

  @action
  async saveApplication(model) {
    return this.saveModel.save({model, message: 'Application details successfully updated.', owner: this});
  }

  @action
  async setReviewOkay() {
    const {application} = this.args;
    application.why_volunteer_review = WHY_VOLUNTEER_REVIEW_OKAY;
    await this.saveModel.save({model: application, message: 'Paragraph marked okay.', owner: this});
  }

  @action
  openProblemReviewDialog() {
    this.showProblemReviewDialog = true;
  }

  @action
  cancelProblemReviewDialog() {
    this.showProblemReviewDialog = false;
  }

}
