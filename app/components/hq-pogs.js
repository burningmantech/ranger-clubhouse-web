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
  STATUS_REDEEMED,
  PogLabels
} from 'clubhouse/models/person-pog';
import {EventPeriodLabels} from 'clubhouse/models/event-date';
import {validatePresence} from 'ember-changeset-validations/validators';
import {htmlSafe} from '@ember/template';
import {
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_KHAKI,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_SHORT
} from 'clubhouse/constants/positions';

// Who are the mentors?
const MENTOR_POSITIONS = [
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_KHAKI,
  MENTOR_SHORT,
];

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
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Record a Full Meal Pog
   */

  @action
  recordFullMealPog() {
    this.createPog(POG_MEAL);
  }

  /**
   * Record a Half Meal Pog
   */

  @action
  recordHalfMealPog() {
    this.createPog(POG_HALF_MEAL);
  }

  /**
   * Record a Shower Pog
   */

  @action
  recordShowerPog() {
    this.createPog(POG_SHOWER);
  }

  /**
   * Attempt to create a pog.
   *
   * @param {string} type
   * @returns {Promise<void>}
   */

  @action
  async createPog(type) {
    let moreInfo = '';
    let bmidWarning = '';
    const {callsign} = this.args.person;
    switch (type) {
      case POG_HALF_MEAL:
      case POG_MEAL:
        if (this.hasMealPass) {
          bmidWarning = `<b class="text-danger">${callsign} has a BMID Meal Pass for the current event period.</b>`
        }
        break;
      case POG_SHOWER:
        if (this.args.showers) {
          bmidWarning = `<b class="text-danger">Person already has a BMID with Wet Spot access.</b>`;
        }
        break;
    }

    if (type === POG_HALF_MEAL) {
      moreInfo = '<span class="text-danger">Half Meal Pogs are tracked digitally. No physical pog is issued.</span>';
    } else {
      moreInfo = "Don't forget to hand over the physical pog";
    }

    if (bmidWarning !== '') {
      bmidWarning = `<p>${bmidWarning}</p>`;
    }

    const pogLabel = PogLabels[type] ?? type;
    this.modal.confirm(`Confirm ${pogLabel}`,
      htmlSafe(
        `${bmidWarning}<p>You are about issue a ${pogLabel}. Are you sure you want to do this?</p>${moreInfo}`),
      async () => {
        const pog = this.store.createRecord('person-pog', {
          person_id: this.args.person.id,
          pog: type,
          status: STATUS_ISSUED,
          timesheet_id: this.args.endedShiftEntry?.id,
        });

        try {
          await pog.save();
          await this.pogs.update();
          this.toast.success('Pog successfully created.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
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

  async _commonPogSave(pog, message, onSaved = null) {
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


  /**
   * Is the person on a Mentor shift? Used to alert the worker the Mentor will be picking up their
   * pogs from the Mentor Cadre in the Mentor Shack.
   *
   * @returns {boolean}
   */

  get isMentor() {
    const {onDutyEntry} = this.args;
    return !!(onDutyEntry && MENTOR_POSITIONS.includes(onDutyEntry.position_id));
  }

}
