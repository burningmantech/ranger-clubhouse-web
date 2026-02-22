import Component from '@glimmer/component';
import {
  WHY_VOLUNTEER_REVIEW_OKAY,
  ExperienceOptions,
} from "clubhouse/models/prospective-application";
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';


export default class VcApplicationDetailsComponent extends Component {
  @service house;
  @service toast;

  @tracked isSubmitting;

  @tracked showProblemReviewDialog;

  @tracked isParagraphExpanded = false;

  experienceOptions = ExperienceOptions;

  @cached
  get eventYearOptions() {
    const years = [];
    for (let i = 1986; i <= this.house.currentYear(); i++) {
      years.push(i);
    }

    return years;
  }

  @action
  async saveApplication(model, isValid) {
    if (!isValid) {
      return false;
    }

    try {
      this.isSubmitting = true;
      await model.save();
      this.toast.success('Application details successfully updated.');
      return true;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }

    return false;
  }

  @action
  async setReviewOkay() {
    const {application} = this.args;
    try {
      application.why_volunteer_review = WHY_VOLUNTEER_REVIEW_OKAY;
      this.isSubmitting = true;
      await application.save();
      this.toast.success('Paragraph marked okay.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  get shouldTruncateParagraph() {
    const text = this.args.application.why_volunteer;
    return text && text.length > 200;
  }

  get showParagraphExpanded() {
    return this.isParagraphExpanded || !this.shouldTruncateParagraph;
  }

  @action
  toggleParagraph() {
    this.isParagraphExpanded = !this.isParagraphExpanded;
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
