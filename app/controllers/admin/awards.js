import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { IconOptions, TypeOptions } from 'clubhouse/models/award';

export default class AdminAwardsIndexController extends ClubhouseController {
  @tracked entry = null;
  @tracked awards;

  iconOptions = IconOptions;
  typeOptions = TypeOptions;

  @action
  newAward() {
    this.entry = this.store.createRecord('award');
  }

  @action
  editAward(award) {
    this.entry = award;
  }

  @action
  removeAward() {
    this.modal.confirm('Delete Award', `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The award has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  saveAward(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The award has been ${model.isNew ? 'created' : 'updated'}.`, () => {
      this.entry = null;
      this.awards.update(); // refresh the list.
    });
  }

  @action
  cancelAward() {
    this.entry = null;
  }
}
