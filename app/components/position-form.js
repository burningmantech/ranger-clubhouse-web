import Component from '@ember/component';
import { action, computed } from '@ember/object';


import PositionValidations from 'clubhouse/validations/position';
import PositionTypes from 'clubhouse/constants/position-types';

export default class PositionFormComponent extends Component {
  position = null;
  trainingPositions = null;
  onSave = null;
  onCancel = null;

  positionTypes = PositionTypes;
  positionValidations = PositionValidations;

  @computed('position.isNew')
  get formTitle() {
    return this.position.isNew ? 'Create Position' : 'Edit Position';
  }

  @computed('trainingPositions')
  get trainingOptions() {
    const options = [
      ['-', '']
    ];

    const positions = this.trainingPositions;

    positions.forEach((position) => {
      options.pushObject([position.title, position.id]);
    })

    return options;
  }

  @action
  save(model, isValid) {
    this.onSave(model, isValid);
  }

  @action
  cancel(model) {
    this.onCancel(model);
  }
}
