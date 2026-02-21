import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {WHY_VOLUNTEER_REVIEW_PROBLEM} from "clubhouse/models/prospective-application";
import {TYPE_VC_COMMENT} from "clubhouse/models/prospective-application-note";

export default class VcApplicationProblemReviewDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting;

  messageForm;

  messageValidation = {
    message: [validatePresence({presence: true, message: 'Please supply a reason / message.'})]
  };

  constructor() {
    super(...arguments);
    this.messageForm = EmberObject.create({message: ''});
  }

  @action
  async submitProblemReview(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;

    try {
      this.isSubmitting = true;
      application.why_volunteer_review = WHY_VOLUNTEER_REVIEW_PROBLEM;
      await application.save();
      await this.ajax.post(`prospective-application/${application.id}/note`, {
        data: {type: TYPE_VC_COMMENT, note: `Why Ranger Review: ${model.message}`}
      });
      await application.reload();
      this.toast.success('Paragraph marked as problematic.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
