import Component from '@ember/component';
import EmberObject from '@ember/object';
import { action, computed } from '@ember/object';



export default class PersonPositionFormComponent extends Component {
  // position id array
  positionIds = null;
  // available positions to select from
  positions = null;

  // actions for save & cancel
  onSave = null;
  onCancel = null;

  positionForm = null;

  didReceiveAttrs() {
    this.set('positionForm', EmberObject.create({ positionIds: this.positionIds }))
  }

  // Create a list of positions options to check
  @computed('positions')
  get positionOptions() {
      if (!this.positions) {
        return [];
      }

      return this.positions.map((position) => {
        return [ position.title, position.id ];
      });
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
