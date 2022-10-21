import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import _ from 'lodash';
import {TypeLabels, TypeSortOrder} from 'clubhouse/models/award';


export default class PersonAwardsController extends ClubhouseController {
  @tracked personAwards;
  @tracked awards;
  @tracked entry;

  @cached
  get awardOptions() {
    const groups = _.map(_.groupBy(this.awards, 'type'), (options, type) => ({
      type,
      groupName: TypeLabels[type] ?? type,
      options: options.map((o) => [o.title, o.id])
    }));

    groups.sort((a, b) => ((TypeSortOrder[a.type] ?? 99) - (TypeSortOrder[b.type] ?? 99)));

    return groups;
  }

  @action
  newAward() {
    this.entry = this.store.createRecord('person-award', {
      person_id: this.person.id,
      award_id: this.awards[0]?.id
    });
  }

  @action
  editAward(award) {
    award.reload().then(() => this.entry = award)
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  closeAward() {
    this.entry = null;
  }

  @action
  saveAward(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.entry.isNew;
    model.save().then(() => {
      if (isNew) {
        this.personAwards.update();
      }
      this.entry = null;
      this.toast.success('The award was successfully saved.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  deleteAward() {
    this.modal.confirm('Delete Award', `Are you sure you wish to delete this award? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The award has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

}
