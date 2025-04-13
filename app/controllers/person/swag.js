import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  TYPE_DEPT_PATCH,
  TYPE_DEPT_PIN,
  TYPE_DEPT_SHIRT,
  TYPE_ORG_PATCH,
  TYPE_ORG_PIN,
  TYPE_OTHER
} from 'clubhouse/models/swag';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class PersonSwagController extends ClubhouseController {
  @tracked personSwag;
  @tracked swags;
  @tracked tshirtOptions;
  @tracked longSleeveOptions;
  @tracked shirtsById;
  @tracked swagOptions;
  @tracked swagEntry;
  @tracked swagTitle;

  swagValidation = {
    swag_id: [validatePresence({presence: true, message: 'Select a swag option'})]
  }

  @action
  newSwag(type) {
    const {person} = this;
    const fields = {person_id: person.id, year_issued: this.house.currentYear()};

    this._setupForSwagEdit(type);

    if (type === 't-shirt') {
      fields.swag_id = person.tshirt_swag_id;
    } else if (type === 'long-sleeve') {
      fields.swag_id = person.long_sleeve_swag_id;
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
  async saveSwag(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.swagEntry.isNew;
    try {
      await model.save();
      if (isNew) {
        this.personSwag.update();
      }
      this.swagEntry = null;
      this.toast.success('The swag was successfully saved.');
    } catch (e) {
      this.house.handleErrorResponse(e);
    }
  }

  @action
  deleteSwag() {
    this.modal.confirm('Delete Swag Record', `Are you sure you wish to delete this swag for the person? This operation cannot be undone.`,
      async () => {
        try {
          await this.swagEntry.destroyRecord();
          this.toast.success('The swag has been deleted.');
          this.swagEntry = null;
        } catch (e) {
          this.house.handleErrorResponse(e);
        }
      });
  }
}
