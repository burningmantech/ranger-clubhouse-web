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
import {
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_KHAKI,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_SHORT
} from 'clubhouse/constants/positions';

// Positions whose workers receive their pogs directly from their Cadre and
// therefore are not issued pogs at the HQ Window.
//
// NOTE: the guidelines copy also names Sandman & Gerlach Patrol, but only the
// Mentor positions currently drive the self-serve alert. See DEFERRED note.
const SELF_SERVE_POG_POSITIONS = [
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_KHAKI,
  MENTOR_SHORT,
];

export default class HqPogsComponent extends Component {
  @service ajax;
  @service hqAction;
  @service house;
  @service modal;
  @service store;

  @tracked isLoading = true;
  @tracked isSubmitting = false;

  @tracked config;
  @tracked pogToCancel;
  @tracked pogToIssue;
  @tracked pogIssueWarnings;
  @tracked pogIssueForm;
  @tracked pogs;

  @tracked pogToEdit;

  pogValidations = {
    notes: [validatePresence(true)]
  };

  constructor() {
    super(...arguments);

    this._loadPogs();
  }

  // Pog-type constants exposed for template bindings (templates cannot import
  // module constants directly).
  POG_MEAL = POG_MEAL;
  POG_HALF_MEAL = POG_HALF_MEAL;
  POG_SHOWER = POG_SHOWER;

  pogLabel(type) {
    return PogLabels[type] ?? type;
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
   * Attempt to create a pog.
   *
   * @param {string} type
   */

  @action
  setupToIssue(type) {
    const warnings = [];
    const {callsign} = this.args.person;
    switch (type) {
      case POG_HALF_MEAL:
      case POG_MEAL:
        if (this.hasMealPass) {
          warnings.push(`${callsign} has a BMID Meal Pass for the current event period. No meal pog should be issued.`);
        }
        break;
      case POG_SHOWER:
        if (this.args.showers) {
          warnings.push(`${callsign} already has a BMID with Wet Spot access. No shower pog should be issued`);
        }
        break;
    }

    if (type === POG_HALF_MEAL) {
      warnings.push(`Half Meal Pogs are tracked digitally. No physical pog is issued.`);
    }

    this.pogIssueWarnings = warnings;
    this.pogToIssue = type;
    this.pogIssueForm = {notes: ''};
  }

  @action
  async savePog(model) {
    if (this.isSubmitting) {
      return;
    }

    const type = this.pogToIssue;
    const pog = this.store.createRecord('person-pog', {
      person_id: this.args.person.id,
      pog: type,
      status: STATUS_ISSUED,
      timesheet_id: this.args.endedShiftEntry?.id,
      notes: model.notes
    });

    this.isSubmitting = true;
    try {
      // On failure, saveWithRollback calls rollbackAttributes() which discards
      // this never-persisted record from the store.
      await this.hqAction.saveWithRollback(pog, {
        successMessage: 'Pog successfully created.',
        onSuccess: async () => {
          await this.pogs.update();
          this.pogToIssue = null;
          if (type === POG_MEAL || type === POG_HALF_MEAL) {
            this.args.onPogIssue?.();
          }
        }
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancelPogIssue() {
    this.pogToIssue = null;
  }

  @action
  editPog(pog) {
    this.pogToEdit = pog;
  }

  @action
  cancelPogEdit() {
    this.pogToEdit = null;
  }

  @action
  async updatePog(model) {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    try {
      await this.hqAction.saveWithRollback(model, {
        successMessage: 'Pog successfully updated.',
        onSuccess: () => this.pogToEdit = null
      });
    } finally {
      this.isSubmitting = false;
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
    if (this.isSubmitting) {
      return;
    }

    this.modal.confirm('Redeem For Full Meal Pog',
      'Please confirm you wish to redeem this Half Meal Pog for a Full Meal Pog',
      async () => {
        if (this.isSubmitting) {
          return;
        }

        this.isSubmitting = true;
        try {
          pog.status = STATUS_REDEEMED;
          await this.hqAction.saveWithRollback(pog, {successMessage: 'Pog has been redeemed.'});
        } finally {
          this.isSubmitting = false;
        }
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
  async saveCancelledPog(pog, isValid) {
    if (!isValid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    try {
      pog.status = STATUS_CANCELLED;
      await this.hqAction.saveWithRollback(pog, {
        successMessage: 'Pog has been cancelled.',
        onSuccess: () => this.pogToCancel = null
      });
    } finally {
      this.isSubmitting = false;
    }
  }


  /**
   * Is the person on a self-serve-pog shift (e.g. a Mentor shift)? Used to alert
   * the worker that they will be picking up their pogs from their Cadre rather
   * than at the HQ Window.
   *
   * @returns {boolean}
   */

  get isMentor() {
    const {onDutyEntry} = this.args;
    return !!(onDutyEntry && SELF_SERVE_POG_POSITIONS.includes(onDutyEntry.position_id));
  }

}
