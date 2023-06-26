import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {Broadcasts} from 'clubhouse/constants/broadcast';
import {validatePresence} from 'ember-changeset-validations/validators';
import {service} from '@ember/service';

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

    this.broadcastForm = {message: !isEmpty(message) ? message : ''};

    this.broadcastValidations = {
      message: [validatePresence({presence: true, message: 'Enter a message.'})],
    };

    if (!this.args.broadcast.has_muster_position) {
      return;
    }

    this.broadcastValidations.position_id = validatePresence({presence: true, message: 'Select a team'});

    const positions = this.args.broadcast.muster_positions;
    const frequent = positions.frequent.slice();

    frequent.unshift({id: '', title: '---'});

    const groupOptions = [{
      groupName: 'Common Shifts',
      options: frequent
    }];

    if (positions.in_progress.length) {
      groupOptions.push({
        groupName: 'Other In Progress Shifts',
        options: positions.in_progress
      });
    } else {
      groupOptions.push({
        groupName: 'No In-Progress Shifts Found',
        options: []
      });
    }

    this.positionOptions = groupOptions;
  }

  @action
  reviewAction(model, isValid) {
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

    this.ajax.request(`rbs/recipients`, {data})
      .then((result) => {
        this.people = result.people;

        if (!this.people.length) {
          this.isReviewing = false;
          this.modal.info(null, 'No qualifying people were found.');
        }
      }).catch((response) => {
      this.house.handleErrorResponse(response);
      // Kill the review
      this.isReviewing = false;
    }).finally(() => this.isSubmitting = false);
  }

  @action
  editMessageAction() {
    this.isReviewing = false;
  }

  @action
  transmitAction() {
    this.isSubmitting = true;

    const data = {
      type: this.args.type,
      sms_message: this.broadcastForm.message
    };

    if (this.args.broadcast.has_muster_position) {
      data.position_ids = [this.broadcastForm.position_id];
      data.position_signed_up = 'any';
    }

    data.sms_message = this.broadcastForm.message;
    this.ajax.request('rbs/transmit', {method: 'POST', data})
      .then((result) => {
        this.result = result;
        this.didTransmit = true;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
