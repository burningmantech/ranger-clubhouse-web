import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {
  // Statuses
  AVAILABLE,
  BANKED,
  CANCELLED,
  CLAIMED,
  EXPIRED,
  SUBMITTED,
  USED,

  EVENT_RADIO,

  TypeOptions
} from 'clubhouse/models/provision';
import _ from 'lodash';

export default class PersonProvisionsComponent extends Component {
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked entry = null;

  @tracked provisions;

  typeOptions = TypeOptions;

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
    this.provisions = this.args.provisions;
  }

  get yearOptions() {
    const currentYear = this.house.currentYear();
    const years = [];
    for (let year = currentYear - 5; year < currentYear + 5; year++) {
      years.push(year);
    }

    return years;
  }

  get eventRadioCount() {
    const provision = _.maxBy(this.provisions.filter((p) => p.isEventRadio && (p.isAvailable || p.isUsing)), 'item_count');
    return provision ? provision.item_count : 'None';
  }

  get effectiveMeals() {
    const periods = {};
    this.provisions.filter((p) => p.isMealPass && (p.isAvailable || p.isUsing)).forEach((p) => {
      p.mealPeriods.split('+').forEach((period) => periods[period] = true);
    });

    if (Object.keys(periods).length === 3) {
      return 'All Eats';
    }

    const meals = [];
    if (periods.pre) {
      meals.push('Pre-Event');
    }
    if (periods.event) {
      meals.push('Event Week');
    }
    if (periods.post) {
      meals.push('Post-Event');
    }

    return meals.length ? meals.join(' / ') : 'None';
  }

  get hasShowers() {
    return !!this.provisions.find((p) => p.isWetSpot && (p.isAvailable || p.isUsing));
  }

  @action
  newProvision() {
    const currentYear = this.house.currentYear();

    this.entry = this.store.createRecord('provision', {
      person_id: this.args.person.id,
      type: EVENT_RADIO,
      status: AVAILABLE,
      source_year: currentYear,
      expires_on: `${currentYear + 3}-09-15`,
    });
  }

  @action
  editProvision(provision) {
    provision.reload().then(() => {
      this.entry = provision;
      provision.set('additional_comments', '');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelProvision() {
    this.entry = null;
  }

  @action
  saveProvision(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    model.save().then(() => {
      this.entry = null;
      this.toast.success(`The access provision was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.provisions.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteProvision(provision) {
    this.modal.confirm('Confirm Delete Document', 'Are you sure you want to delete this provision? This operation cannot be undone.', () => {
      provision.destroyRecord().then(() => {
        this.entry = null;
        this.toast.success('The provision was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  showAction() {
    this.isLoading = true;

    const data = {person_id: this.args.person.id};
    if (!this.isShowingAll) {
      data.status = 'all';
    }
    this.store.query('provision', data).then((provisions) => {
      this.provisions = provisions;
      this.isShowingAll = !this.isShowingAll;
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  get isTicketingOpen() {
    return this.args.ticketingInfo.period === 'open';
  }
}
