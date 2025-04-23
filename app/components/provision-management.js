import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  AVAILABLE,
  BANKED,
  CANCELLED,
  CLAIMED, EVENT_RADIO,
  EXPIRED, MEALS,
  SUBMITTED,
  TypeOptions,
  USED, WET_SPOT
} from "clubhouse/models/provision";
import {isEmpty} from "lodash";

export default class ProvisionManagementComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked entry = null;

  @tracked provisions;
  @tracked package;

  @tracked showTable = false;
  @tracked initialType = 'all';

  typeOptions = TypeOptions;

  isLoaded = false;

  statusOptions = [
    ["Available", AVAILABLE],
    ["Claimed", CLAIMED],
    ["Banked", BANKED],
    ["Submitted", SUBMITTED],
    ["Used", USED],
    ["Cancelled", CANCELLED],
    ["Expired", EXPIRED]
  ];

  constructor() {
    super(...arguments);

    if (this.args.inline) {
      this.loadProvisions();
    }
  }

  @action
  async loadProvisions() {
    try {
      const personId = this.args.person.id;
      this.isSubmitting = true;
      this.provisions = await this.store.query('provision', {person_id: personId});
      await this._loadPackage();
      if (this.args.inline) {
        this.showTable = true;
      }
      this.isLoaded = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  manageShowers() {
    this.manageProvisions('showers')
  }

  @action
  manageRadios() {
    this.manageProvisions('radios');
  }

  @action
  manageMeals() {
    this.manageProvisions('meals')
  }

  @action
  async manageProvisions(type) {
    await this.loadProvisions();
    this.showTable = true;
    this.initialType = isEmpty(type) ? 'all' : type;
  }

  @action
  closeTable() {
    this.showTable = false;
  }

  async _loadPackage() {
    this.package = await this.ajax.request(`provision/${this.args.person.id}/package`);
  }

  get yearOptions() {
    const currentYear = this.house.currentYear();
    const years = [];
    for (let year = currentYear - 5; year < currentYear + 5; year++) {
      years.push(year);
    }

    return years;
  }

  @action
  newRadio() {
    this.newProvision(EVENT_RADIO);
  }

  @action
  newShower() {
    this.newProvision(WET_SPOT);
  }

  @action
  newMeal() {
    this.newProvision(MEALS);
  }

  @action
  async newProvision(type) {
    if (!this.isLoaded) {
      await this.loadProvisions();
    }

    const currentYear = this.house.currentYear();

    this.entry = this.store.createRecord('provision', {
      person_id: this.args.person.id,
      type,
      status: AVAILABLE,
      source_year: currentYear,
      expires_on: `${currentYear + 3}-09-15`,
    });

    if (type === EVENT_RADIO) {
      this.entry.item_count = 1;
    }

    this.showTable = true;
  }

  @action
  async editProvision(provision) {
    try {
      this.isSubmitting = true;
      await provision.reload();
      this.entry = provision;
      provision.additional_comments = '';
    } catch (response) {
      this.house.handleErrorResponse(response, provision);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancelProvision() {
    this.entry = null;
  }

  @action
  async saveProvision(model, isValid) {
    if (!isValid) {
      return;
    }

    const {isNew} = model;

    try {
      this.isSubmitting = true;
      await model.save();
      await this._loadPackage();
      this.entry = null;
      this.toast.success(`The provision was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        await this.provisions.update();
      }
      await this.args.onUpdate?.(this.package);
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  deleteProvision(provision) {
    this.modal.confirm('Confirm Delete Provision',
      'This operation cannot be undone. Are you sure you want to delete this provision?',
      async () => {
        try {
          this.isSubmitting = true;
          await provision.destroyRecord();
          this.entry = null;
          await this._loadPackage();
          this.toast.success('The provision was successfully deleted.');
          await this.args.onUpdate?.(this.package);
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  async showAllAction() {
    this.isSubmitting = true;

    const data = {person_id: this.args.person.id};
    if (!this.isShowingAll) {
      data.status = 'all';
    }
    try {
      this.isSubmitting = true;
      this.provisions = await this.store.query('provision', data);
      this.isShowingAll = !this.isShowingAll;
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }
}
