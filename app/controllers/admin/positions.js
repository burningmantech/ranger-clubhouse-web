import Controller from '@ember/controller';
import { computed, action } from '@ember-decorators/object';
import PositionTypes from 'clubhouse/constants/position-types';

export default class PositionController extends Controller {
  typeFilter =  'All';

  @computed
  get typeOptions() {
    const types = PositionTypes.slice();

    types.unshift('All');
    return types;
  }

  @computed('positions.@each.title', 'typeFilter')
  get viewPositions() {
    const typeFilter = this.typeFilter;
    let positions = this.positions;

    if (typeFilter != 'All') {
      positions = positions.filterBy('type', typeFilter);
    }

    return positions.sortBy('title');
  }

  @computed('positions.@each.type')
  get trainingPositions() {
    const positions = [ ];
    this.positions.forEach((position) => {
      if (position.type == 'Training' && !position.title.match(/trainer/i)) {
        positions.pushObject(position);
      }
    })

    return positions;
  }

  @action
  new() {
    this.set('position', this.store.createRecord('position'));
  }

  @action
  edit(position) {
    this.set('position', position);
  }

  @action
  delete(position) {

    this.modal.confirm(`Confirm Deleting "${position.title}"`, `By deleting this position important historical nformation will be lost. Are you use you want to do this?`,
      () => {
          position.destroyRecord().then(() => {
            this.toast.success('The position has been deleted.');
            this.positions.removeObject(position);
          })
      }
    )
  }

  @action
  save(model, isValid) {
    const isNew = model.get('isNew');

    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The position has been ${isNew ? 'created' : 'updated'}.`, () => {
      this.set('position', null);
      if (isNew) {
        this.positions.pushObject(model);
      }
    })
  }

  @action
  cancel(model) {
    if (!model.get('isDirty')) {
      this.set('position', null);
      return;
    }

    this.modal.confirm('Unsaved changes', 'The position has unsaved changed. Are you sure you wish to cancel?', () => {
      this.set('position', null);
    })
  }

}
