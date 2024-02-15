import Component from '@glimmer/component';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {service} from '@ember/service';
import {TYPE_ALPHA, TYPE_TRAINER, TYPE_TRAINING} from "clubhouse/models/survey";
import { ALPHA } from "clubhouse/constants/positions";

export default class SurveyFormComponent extends Component {
  @service house;
  @service toast;

  typeOptions = [
    {id: TYPE_TRAINING, title: 'Trainee-for-Training Survey'},
    {id: TYPE_TRAINER, title: 'Trainer-for-Trainer Survey'},
    {id: TYPE_ALPHA, title: 'Alpha Survey'}
  ];

  surveyValidations = {
    title: [validatePresence(true)],
    prologue: [validatePresence(true)],
    epilogue: [validatePresence(true)],
    type: [validatePresence(true)]
  };

  alphaOption = [
    [ 'Alpha', ALPHA ]
  ];

  get positionOptions() {
    const positions = this.args.positions.map((p) => ({id: p.id, title: p.title}));
    positions.unshift({id: null, title: '----'});

    return positions
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
}
