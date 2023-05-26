import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import _ from 'lodash';
import {TypeLabels, TypeSortOrder} from 'clubhouse/models/award';
import {TYPE_DEPT_PATCH, TYPE_DEPT_PIN, TYPE_DEPT_SHIRT, TYPE_ORG_PATCH, TYPE_ORG_PIN, TYPE_OTHER} from 'clubhouse/models/swag';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class PersonAwardsController extends ClubhouseController {
  @tracked personAwards;
  @tracked awards;
  @tracked entry;

  @tracked personSwag;
  @tracked swags;
  @tracked tshirtOptions;
  @tracked longSleeveOptions;
  @tracked shirtsById;
  @tracked swagOptions;
  @tracked swagEntry;
  @tracked swagTitle;

  swagValidation = {
    swag_id: [ validatePresence({ presence: true, message: 'Select a swag option'})]
  }

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

  @action
  newSwag(type) {
    const {person} = this;
    const fields = {person_id: person.id, year_issued: this.house.currentYear()};

    this._setupForSwagEdit(type);

    if (type === 't-shirt') {
      fields.swag_id = person.tshirt_swag_id;
    } else if (type === 'long-sleeve') {
      fields.swag_id = person.long_sleeve_swag_ig;
    }

    this.swagEntry = this.store.createRecord('person_swag', fields);
  }

  _setupForSwagEdit(type) {
    switch (type) {
      case 't-shirt':
        this.swagOptions = this.tshirtOptions;
        this.swagTitle = 'T-Shirt';
        break;
      case 'long-sleeve':
        this.swagOptions = this.longSleeveOptions;
        this.swagTitle = 'Long Sleeve Shirt';
        break;
      case 'dept-pin':
        this.swagOptions = this._buildSwagOptions(TYPE_DEPT_PIN);
        this.swagTitle = 'Ranger Service Pin';
        break;
      case 'dept-patch':
        this.swagOptions = this._buildSwagOptions(TYPE_DEPT_PATCH);
        this.swagTitle = 'Ranger Service Patch';
        break;
      case 'org-patch':
        this.swagOptions = this._buildSwagOptions(TYPE_ORG_PATCH);
        this.swagTitle = 'Org Service Patch';
        break;
      case 'org-pin':
        this.swagOptions = this._buildSwagOptions(TYPE_ORG_PIN);
        this.swagTitle = 'Org Service Pin';
        break;
      default:
        this.swagTitle = 'Other Swag';
        this.swagOptions = this._buildSwagOptions(TYPE_OTHER);
        break;
    }
  }

  @action
  editSwag(ps) {
    let type = ps.swag.type;
    if (type === TYPE_DEPT_SHIRT) {
      type = ps.swag.shirt_type;
    }
    this._setupForSwagEdit(type);
    this.swagEntry = ps;
  }

  _buildSwagOptions(type) {
    return this.swags.filter((s) => s.type === type).map((s) => [s.title, s.id]);
  }

  @action
  cancelSwag() {
    this.swagEntry = null;
  }

  @action
  saveSwag(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.swagEntry.isNew;
    model.save().then(() => {
      if (isNew) {
        this.personSwag.update();
      }
      this.swagEntry = null;
      this.toast.success('The swag was successfully saved.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  deleteSwag() {
    this.modal.confirm('Delete Swag Record', `Are you sure you wish to delete this swag for the person? This operation cannot be undone.`, () => {
      this.swagEntry.destroyRecord().then(() => {
        this.toast.success('The swag has been deleted.');
        this.swagEntry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }
}
