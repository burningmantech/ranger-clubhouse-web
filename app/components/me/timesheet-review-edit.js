import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {STATUS_PENDING} from "clubhouse/models/timesheet";
import {isEmpty} from 'lodash';
import dayjs from "dayjs";

export default class MeTimesheetReviewEditComponent extends Component {
  @service house;
  @service modal;
  @service shiftManage;
  @service toast;

  @tracked isSubmitting = false;
  @tracked desiredPositionOptions;

  constructor() {
    super(...arguments);
    const {entry} = this.args;
    this.desiredPositionOptions = this.args.positions.map((p) => [p.title, p.id]);
    this.desiredPositionOptions.unshift({
      id: null,
      title: `${entry.position.title} is correct`,
    })
  }

  // Save correction notes
  @action
  save(model) {
    if (!model.desired_position_id && !model.desired_on_duty && !model.desired_off_duty) {
      this.modal.info('No corrections entered',
        'You did not select a position, and/or enter the correct start or ending times');
      return;
    }

    if (isEmpty(model.additional_notes) && !this.args.entry.notes.length) {
      model.addError('additional_notes', 'Enter a reason why the entry should be corrected.');
      return;
    }

    const positionId = isEmpty(model.desired_position_id) ? model.position_id : model.desired_position_id,
      onDuty = isEmpty(model.desired_on_duty) ? model.on_duty : model.desired_on_duty,
      offDuty = isEmpty(model.desired_off_duty) ? model.off_duty : model.desired_off_duty;

    if (dayjs(offDuty).isBefore(dayjs(onDuty))) {
      if (model.desired_on_duty) {
        model.addError('desired_on_duty', 'The on duty time is after the off duty time.');
      }
      if (model.desired_off_duty) {
        model.addError('desired_off_duty', 'The off duty time is before the on duty time.');
      }
      return;
    }

    if (model._changes['desired_position_id']
      || model._changes['desired_on_duty']
      || model._changes['desired_off_duty']) {
      this.shiftManage.checkDateTime(positionId, onDuty, offDuty, () => this._performSave(model))
    } else {
      this._performSave(model);
    }
  }

  async _performSave(model) {
    try {
      model.review_status = STATUS_PENDING;
      await model.save();
      this.args.entry.additional_notes = null;
      this.args.onUpdate?.();
      this.toast.success('The correction note has been submitted.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }
}
