import Component from '@glimmer/component';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {service} from '@ember/service';
import {
  TYPE_ALPHA,
  TYPE_MENTOR_FOR_MENTEES,
  TYPE_MENTEES_FOR_MENTOR,
  AlphaTypeOptions,
  ARTTypeOptions,
  TrainerTypeOptions,
} from "clubhouse/models/survey";
import {ALPHA} from "clubhouse/constants/positions";
import {cached} from '@glimmer/tracking';
import {SURVEY_MANAGEMENT, SURVEY_MANAGEMENT_BASE} from "clubhouse/constants/roles";

export default class SurveyFormComponent extends Component {
  @service house;
  @service session;
  @service toast;

  surveyValidations = {
    title: [validatePresence(true)],
    prologue: [validatePresence(true)],
    epilogue: [validatePresence(true)],
    type: [validatePresence(true)]
  };

  alphaOption = [
    ['Alpha', ALPHA]
  ];

  @cached
  get typeOptions() {
    let options = [];

    if (this.session.hasRole(SURVEY_MANAGEMENT_BASE | ALPHA)) {
      options = [...AlphaTypeOptions];
    }

    if (this.session.hasARTSurveyManagement) {
      options = [...options, ...ARTTypeOptions];
    }

    if (this.session.hasARTSurveyManagement || this.session.hasRole(SURVEY_MANAGEMENT)) {
      options = [...options, ...TrainerTypeOptions];
    }

    return options;
  }

  @action
  async saveSurveyAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    if (model.type === TYPE_ALPHA) {
      model.position_id = ALPHA
    }

    try {
      await model.save();
      this.toast.success(`Survey was successfully ${isNew ? 'created' : 'updated'}.`);
      this.args.onSave();
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    }
  }

  @action
  cancelSurveyAction() {
    this.args.onCancel();
  }

  @action
  positionOptions(type) {
    switch (type) {
      case TYPE_ALPHA:
        return this.alphaOption;
      case TYPE_MENTOR_FOR_MENTEES:
        return this.args.mentorPositionOptions;
      case TYPE_MENTEES_FOR_MENTOR:
        return this.args.menteePositionOptions;
      default:
        return this.args.positionOptions;
    }
  }

  positionLabel(type) {
    switch (type) {
      case TYPE_ALPHA:
        return 'Alpha Position';
      case TYPE_MENTOR_FOR_MENTEES:
        return 'Mentor Position';
      case TYPE_MENTEES_FOR_MENTOR:
        return 'Mentee Position';
      default:
        return 'Training Position';
    }
  }

  @action
  isMentorOrMenteeType(type) {
    return type === TYPE_MENTEES_FOR_MENTOR || type === TYPE_MENTOR_FOR_MENTEES;
  }

  @action
  mentoringPositionLabel(type) {
    return type === TYPE_MENTOR_FOR_MENTEES ? 'Mentee Position' : 'Mentor Position';
  }

  @action
  mentoringPositionOptions(type) {
    return type === TYPE_MENTEES_FOR_MENTOR ? this.args.mentorPositionOptions : this.args.menteePositionOptions;
  }
}
