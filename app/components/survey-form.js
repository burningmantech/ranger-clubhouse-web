import Component from '@glimmer/component';
import { action } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import { inject as service } from '@ember/service';

export default class SurveyFormComponent extends Component {
  @service house;
  @service toast;

  typeOptions = [
    { id: 'training', title: 'Trainee Training Survey' },
    { id: 'trainer', title: 'Trainer-for-Trainer Survey' },
    { id: 'slot', title: 'Shift Survey (not implemented)' }
  ];

  surveyValidations = {
    title: [ validatePresence(true) ],
    prologue: [ validatePresence(true) ],
    epilogue: [ validatePresence(true) ],
    type: [ validatePresence(true) ]
  };

  get positionOptions() {
    const positions = this.args.positions.map((p) => { return { id: p.id, title: p.title }; })
    positions.unshift({ id: null, title: '----'});

    return positions
  }

  @action
  saveSurveyAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    model.save().then(() => {
      this.toast.success(`Survey was successfully ${isNew ? 'created' : 'updated'}.`);
      this.args.onSave();
    }).catch((response) => this.house.handleErrorResponse(response, model))
  }

  @action
  cancelSurveyAction() {
    this.args.onCancel();
  }
}
