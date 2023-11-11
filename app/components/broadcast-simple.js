import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {Broadcasts} from 'clubhouse/constants/broadcast';
import {validatePresence} from 'ember-changeset-validations/validators';
import {service} from '@ember/service';
import {buildBroadcastOptions} from "clubhouse/utils/build-broadcast-options";
import validateDateTime from "clubhouse/validators/datetime";
import dayjs from 'dayjs';

export default class BroadcastSimpleComponent extends Component {
  @tracked isReviewing = false;
  @tracked isSubmitting = false;
  @tracked people = null;
  @tracked didTransmit = false;
  @tracked result;

  @service ajax;
  @service toast;
  @service modal;
  @service house;

  constructor() {
    super(...arguments);
    const message = Broadcasts[this.args.type].message;

    this.broadcastForm = {message: !isEmpty(message) ? message : '' };

    this.broadcastValidations = {
      message: [validatePresence({presence: true, message: 'Enter a message.'})],
    };

    if (!this.args.broadcast.has_muster_position) {
      return;
    }

    this.broadcastValidations.position_id = [validatePresence({presence: true, message: 'Select a team'})];
    this.broadcastValidations.expires_at = [validateDateTime(), validatePresence({presence: true})]
    this.broadcastForm.expires_at = dayjs().add(12, 'h').format('YYYY-MM-DD HH:mm');
    const in_progress_positions = this.args.broadcast.in_progress_positions;
    const groupOptions = buildBroadcastOptions(this.args.broadcast.positions);

    if (in_progress_positions.length) {
      groupOptions.push({
        groupName: 'Other In Progress Positions',
        options: in_progress_positions
      });
    } else {
      groupOptions.push({
        groupName: 'No In-Progress Positions Found',
        options: []
      });
    }

    this.positionOptions = groupOptions;
  }

  @action
  async reviewAction(model, isValid) {
    if (!isValid) {
      return;
    }

    // commit to backing model
    model.execute();

    this.isReviewing = true;
    this.isSubmitting = true;

    const data = {type: this.args.type};

    if (this.args.broadcast.has_muster_position) {
      data.position_ids = [this.broadcastForm.position_id];
      data.position_signed_up = 'any';
    }

    try {
      const {people} = await this.ajax.request(`rbs/recipients`, {data});
      this.people = people;

      if (!this.people.length) {
        this.isReviewing = false;
        this.modal.info(null, 'No qualifying people were found.');
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
      // Kill the review
      this.isReviewing = false;
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  editMessageAction() {
    this.isReviewing = false;
  }

  @action
  async transmitAction() {
    const data = {
      type: this.args.type,
      sms_message: this.broadcastForm.message
    };

    if (this.args.broadcast.has_muster_position) {
      data.position_ids = [this.broadcastForm.position_id];
      data.position_signed_up = 'any';
    }

    data.sms_message = this.broadcastForm.message;
    this.isSubmitting = true;
    try {
      this.result = await this.ajax.request('rbs/transmit', {method: 'POST', data});
      this.didTransmit = true;
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }
}
