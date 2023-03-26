import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  POG_MEAL,
  POG_HALF_MEAL,
  POG_SHOWER,
  STATUS_CANCELLED,
  STATUS_ISSUED,
  STATUS_REDEEMED
} from 'clubhouse/models/person-pog';
import {EventPeriodLabels} from 'clubhouse/models/event-date';
import {validatePresence} from 'ember-changeset-validations/validators';


export default class HqPogsComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isLoading = true;

  @tracked config;
  @tracked pog;
  @tracked pogToCancel;
  @tracked pogs;

  pogValidations = {
    notes: [validatePresence(true)]
  };

  constructor() {
    super(...arguments);

    this._loadPogs();
  }

  /**
   * Load up the pogs
   *
   * @returns {Promise<void>}
   * @private
   */

  async _loadPogs() {
    try {
      this.config = await this.ajax.request('person-pog/config').then(({config}) => config);
      this.pogs = await this.store.query('person-pog', {
        person_id: this.args.person.id,
        year: this.house.currentYear()
      });

      if (this.config.meal_half_pog_enabled) {
        this.pogOptions = [
          ['Full Meal Pog', POG_MEAL],
          ['1/2 Meal Pog', POG_HALF_MEAL],
          ['Shower Pog', POG_SHOWER]
        ];
      } else {
        this.pogOptions = [
          ['Full Meal Pog', POG_MEAL],
          ['Shower Pog', POG_SHOWER]
        ];
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Setup to create a new pog
   */

  @action
  newPog() {
    this.pog = this.store.createRecord('person-pog', {
      person_id: this.args.person.id,
      pog: POG_MEAL,
      status: STATUS_ISSUED,
      timesheet_id: this.args.endedShiftEntry?.id,
    });
  }

  /**
   * Cancel the new pog
   */
  @action
  cancelNewPog() {
    this.pog = null;
  }

  /**
   * Attempt to create a pog.
   *
   * @param model
   * @returns {Promise<void>}
   */

  @action
  async savePog(model) {
    try {
      await model.save();
      await this.pogs.update();
      this.toast.success('Pog successfully created.');
      this.pog = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Confirm with the user about redeeming a 1/2 meal pog for a full one.
   *
   * @param pog
   * @returns {Promise<void>}
   */

  @action
  async redeemForFullMealPog(pog) {
    this.modal.confirm('Redeem For Full Meal Pog',
      'Please confirm you wish to redeem this Half Meal Pog for a Full Meal Pog',
      async () => {
        pog.status = STATUS_REDEEMED;
        await this._commonPogSave(pog, 'Pog has been redeemed.');
      });
  }

  /**
   * Return the current event period as a human-readable label
   *
   * @returns {string}
   */
  get currentPeriodLabel() {
    return EventPeriodLabels[this.args.period];
  }

  /**
   * Does the person have a meal pass for the current period?
   *
   * @returns {boolean|*}
   */

  get hasMealPass() {
    return this.args.eventPeriods[this.args.period].hasPass;
  }

  /**
   * Common routine to save the pogs!
   *
   * @param {PersonPogModel} pog
   * @param {string} message
   * @param onSaved
   * @returns {Promise<void>}
   * @private
   */

  async _commonPogSave(pog, message, onSaved=null) {
    try {
      await pog.save();
      this.toast.success(message);
      onSaved?.();
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Confirm with the user about cancelling a pog.
   *
   * @param pog
   */
  @action
  confirmPogCancel(pog) {
    this.pogToCancel = pog;
  }

  /**
   * Cancel the cancel pog action.
   */

  @action
  cancelCancelPog() {
    this.pogToCancel = null;
  }

  /**
   * Attempt to save the pog as a cancelled pog (with note on why).
   *
   * @param pog
   * @param isValid
   */

  @action
  saveCancelledPog(pog, isValid) {
    if (!isValid) {
      return;
    }

    pog.status = STATUS_CANCELLED;
    this._commonPogSave(pog, 'Pog has been cancelled.', () => this.pogToCancel = null);
  }
}
