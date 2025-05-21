import Component from '@glimmer/component';
import { service } from '@ember/service';
import validateDateTime from "clubhouse/validators/datetime";
import {validatePresence} from 'ember-changeset-validations/validators';
import { action } from '@ember/object';
import positionsForTimesheetMissing from "clubhouse/utils/positions-for-timesheet-missing";
import {tracked} from '@glimmer/tracking';

export default class MeTimesheetMissingEditComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service shiftManage;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isLoadingPositions = false;
  @tracked positionOptions;

  timesheetValidations = {
    on_duty: [validateDateTime({before: 'off_duty', beforeName: 'Ending Date/Time'}), validatePresence(true)],
    off_duty: [validateDateTime({after: 'on_duty', afterName: 'Starting Date/Time'}), validatePresence(true)],
    additional_notes: [validatePresence(true)],
    partner: [validatePresence({ presence: true, message: 'Enter a partner - use "none" if you had no shift partner.'})]
  };

  constructor() {
    super(...arguments);

     this._loadPositions();
  }

  async _loadPositions() {
    try {
      this.isLoadingPositions = true;
      const {positions} = await this.ajax.request(`person/${this.args.person.id}/positions`, {data: {include_past_grants: 1, exclude_trainee: 1}});
      this.positionOptions = positionsForTimesheetMissing(positions);
      const { entry} = this.args;
      if (entry.isNew) {
        entry.person_id = this.args.person.id;
        entry.position_id = this.positionOptions[0][1];
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoadingPositions = false;
    }
  }
   /**
   * Save a timesheet missing request
   * @param {TimesheetMissingModel} model
   * @param {boolean} isValid
   */

  @action
  async saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    if (!model.isDirty) {
      this.modal.info('', `You did not enter any ${isNew ? 'new' : ''} information.`);
      return;
    }

    if (model._changes['position_id'] || model._changes['on_duty'] || model._changes['off_duty']) {
      await this.shiftManage.checkDateTime(model.position_id, model.on_duty, model.off_duty, () => this._saveCommon(model));
    } else {
      await this._saveCommon(model);
    }
  }

  async _saveCommon(model) {
    const isNew = model.isNew;

    try {
      this.isSubmitting = true;
      await model.save();
      this.toast.success(`The request has been successfully ${isNew ? 'submitted' : 'updated'}.`);
      this.args.onSave(isNew);
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }
}
