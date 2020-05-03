import Component from '@ember/component';
import EmberObject, { action, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { Broadcasts } from 'clubhouse/constants/broadcast';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class BroadcastSimpleComponent extends Component {
  isReviewing = false;
  isSubmitting = false;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    const message = Broadcasts[this.type].message;

    this.set('broadcastForm', EmberObject.create({ message: !isEmpty(message) ? message : '' }));
  }

  @computed('broadcast.muster_positions')
  get positionOptions() {
    const positions = this.broadcast.muster_positions;
    const frequent = positions.frequent.slice();

    frequent.unshift({ id: '', title: '---' });

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
        groupName: 'No In Progress Shifts Founnd',
        options: []
      });
    }

    return groupOptions;
  }

  @computed('broadcast.has_muster_position')
  get broadcastValidations() {
    const validations = {
      message: validatePresence({ presence: true, message: 'Enter a message.' }),
    };

    if (this.broadcast.has_muster_position) {
      validations.position_id = validatePresence({ presence: true, message: 'Select a team' });
    }

    return validations;
  }

  @action
  reviewAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    // commit to backing model
    model.execute();

    this.set('isReviewing', true);
    this.set('isSubmitting', true);

    const data = { type: this.type };

    if (this.broadcast.has_muster_position) {
      data.position_id = this.broadcastForm.position_id;
      data.position_signed_up = 'any';
    }

    this.set('textMessage', this.broadcastForm.message);

    this.ajax.request(`rbs/recipients`, { data })
      .then((result) => {
        this.set('people', result.people);

        if (this.people.length == 0) {
          this.set('isReviewing', false);
          this.toast.error('No qualifying people were found.');
        }
      }).catch((response) => {
        this.house.handleErrorResponse(response);
        // Kill the review
        this.set('isReviewing', false);
      })
      .finally(() => this.set('isSubmitting', false));
  }

  @action
  editMessageAction() {
    this.set('isReviewing', false);
  }

  @action
  transmitAction() {
    this.set('isSubmitting', true);

    const data = {
      type: this.type,
      sms_message: this.broadcastForm.message
    };

    if (this.broadcast.has_muster_position) {
      data.position_id = this.broadcastForm.position_id;
      data.position_signed_up = 'any';
    }

    data.sms_message = this.broadcastForm.message;
    this.ajax.request('rbs/transmit', { method: 'POST', data })
      .then((result) => {
        this.set('result', result);
        this.set('didTransmit', true);
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }
}
