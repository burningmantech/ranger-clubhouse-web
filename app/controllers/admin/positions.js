import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import PositionTypes from 'clubhouse/constants/position-types';
import PositionValidations from 'clubhouse/validations/position';

export default class PositionController extends Controller {
  @tracked position = null;

  positionTypes = PositionTypes;
  positionValidations = PositionValidations;

  @tracked typeFilter = 'All';

  get typeOptions() {
    const types = PositionTypes.slice();

    types.unshift('All');
    return types;
  }

  activeFilter = 'all';
  activeOptions = [
    {id: 'all', title: 'All'},
    {id: 'active', title: 'Active'},
    {id: 'inactive', title: 'Inactive'},
  ];

  @computed('positions.@each.title', 'typeFilter', 'activeFilter')
  get viewPositions() {
    let positions = this.positions;
    const typeFilter = this.typeFilter;
    const activeFilter = this.activeFilter;

    if (typeFilter != 'All') {
      positions = positions.filterBy('type', typeFilter);
    }

    if (activeFilter) {
      if (activeFilter == 'active') {
        positions = positions.filterBy('active', true);
      } else if (activeFilter == 'inactive') {
        positions = positions.filterBy('active', false);
      }
    }

    return positions.sortBy('title');
  }

  @computed('positions.@each.type')
  get trainingPositions() {
    const positions = [];
    this.positions.forEach((position) => {
      if (position.type == 'Training' && !position.title.match(/trainer/i)) {
        positions.pushObject(position);
      }
    });

    return positions;
  }

  get trainingOptions() {
    const options = [
      ['-', '']
    ];

    this.trainingPositions.forEach((position) => {
      options.pushObject([position.title, position.id]);
    });

    return options;
  }

  @action
  newAction() {
    this.position = this.store.createRecord('position');
  }

  @action
  editAction(position) {
    this.position = position;
  }

  @action
  deleteAction() {
    this.modal.confirm(`Confirm Deleting "${this.position.title}"`,
      `By deleting this position important historical information will be lost. Are you use you want to do this?`,
      () => {
        this.position.destroyRecord().then(() => {
          this.toast.success('The position has been deleted.');
          this.position = null;
        }).catch((response) => this.house.handleErrorResponse(response));
      }
    )
  }

  @action
  saveAction(model, isValid) {
    const isNew = model.get('isNew');

    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The position has been ${isNew ? 'created' : 'updated'}.`, () => {
      this.position = null;
      this.positions.update(); // refresh the list.
    })
  }

  @action
  cancelAction() {
    this.position = null;
  }
}
