/*
 * a RBS complex broadcast.
 *
 * The broadcast may have one or more of the following attrbutes:
 *
 * - Person status selection
 * - Position
 * - Shift sign ups
 * - Training (completed, passed, or not signed up)
 * - on site
 * - if person is attending next event (based on shift sign ups)
 */

import Component from '@ember/component';
import EmberObject, { action, computed } from '@ember/object';

import { isEmpty } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';
import validatePresenceIf from 'clubhouse/validators/presence-if';

import { Broadcasts } from 'clubhouse/constants/broadcast';
import moment from 'moment';

export default class BroadcastComplexComponent extends Component {
  config = null;
  type = null;
  broadcast = null;

  isReviewing = false;
  isSubmitting = false;
  noPeople = false;

  statusOptions = [
    'active',
    'alpha',
    'auditor',
    'inactive extension',
    'inactive',
    'prospective waitlist',
    'prospective',
    'retired'
  ];

  signedUpOptions = [
    ['Who are signed up for a team shift', 'signed-up'],
    ['Who are NOT signed up for a team shift', 'not-signed-up'],
    ['Who are on the team and does not matter if they are signed up or not', 'any']
  ];

  trainingOptions = [
    ['Does not matter if they are Dirt Trained or not', 'any'],
    ['Who have passed Dirt Training', 'passed'],
    ['Who are signed up for OR passed Dirt Training', 'registered'],
    ['Who are NOT signed up for Dirt Training', 'no-training']
  ];

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    const defaults = Broadcasts[this.type];
    const message = defaults.message;
    const subject = defaults.subject;

    this.set('broadcastForm', EmberObject.create({
      alert_id: '',
      attending: true,
      message: !isEmpty(message) ? message : '',
      on_site: true,
      position_id: '',
      position_signed_up: 'any',
      send_clubhouse: true,
      send_email: true,
      send_sms: true,
      slot_id: '',
      slotPositionId: null,
      statuses: ['active'],
      subject: !isEmpty(subject) ? subject : '',
      training: 'any',
    }));
  }

  // Build up a validation object based on the broadcast type
  @computed('broadcast')
  get broadcastValidations() {
    const broadcast = this.broadcast;

    // The basics - subject and messages
    const validations = {
      sms_message: validatePresenceIf({ if_set: 'send_sms', message: 'Enter a text message.' }),
      subject: validatePresenceIf({ if_set: ['send_clubhouse', 'send_email'], message: 'Enter a subject.' }),
      message: validatePresenceIf({ if_set: ['send_clubhouse', 'send_email'], message: 'Enter a message.' })
    };

    // Need to select a team/position
    if (broadcast.has_position) {
      validations.position_id = validatePresence({ presence: true, message: 'Select a team' });
    }

    // Need to select a position, and then a slot
    if (broadcast.has_slot) {
      validations.slotPositionId = validatePresence({ presence: true, message: 'Select a position' });
      validations.slot_id = validatePresence({ presence: true, message: 'Select a shift' });
    }

    // Need to select an alert preference type
    if (broadcast.alerts) {
      validations.alert_id = validatePresence({ presence: true, message: 'Choose an alert type' });
    }

    return validations;
  }

  // Build alert options
  @computed('broadcast.alerts')
  get alertOptions() {
    const alerts = this.broadcast.alerts.map((alert) => {
      return [`${alert.on_playa ? "On Playa" : "Pre-Event"}: ${alert.title}`, alert.id];
    });

    alerts.unshift({ id: '', title: '----' });
    return alerts;
  }

  // Build up the position options from the available slots
  @computed('broadcast.slots')
  get slotPositionOptions() {
    const options = this.broadcast.slots.map((group, idx) => {
      return {
        id: idx,
        title: group.title
      }
    });

    options.unshift({ id: '', title: '----' });

    return options;
  }

  // Build up the basic position options
  @computed('broadcast.positions')
  get positionOptions() {
    const positions = this.broadcast.positions.slice();

    positions.unshift({ id: '', title: '----' });

    return positions;
  }

  // Build the slot options based on the positon selected
  @computed('broadcastForm.slotPositionId')
  get slotOptions() {
    const id = this.broadcastForm.slotPositionId;

    if (id == null) {
      return [];
    }

    const position = this.broadcast.slots[parseInt(id)];
    const slots = position.slots.map((slot) => {
      const date = moment(slot.begins).format('ddd MMM DD [@] HH:mm');
      return { id: slot.id, title: `${date} ${slot.description} (${slot.signed_up} sign up)` };
    });
    slots.unshift({ id: '', title: '----' });

    return slots;
  }

  @action
  slotPositionChange(name, value) {
    // Hackary: when the user selects the position from the available slots,
    // need to cause slotOptions to recomputed to only build for that positions.
    this.broadcastForm.set('slotPositionId', value);
  }

  // Build up the API params for the candidates or transmit request
  _buildParams() {
    const data = { type: this.type };
    const broadcast = this.broadcast;
    const form = this.broadcastForm;

    if (broadcast.alerts) {
      data.alert_id = form.alert_id;
      this.set('broadcastAlert', broadcast.alerts.find((alert) => form.alert_id == alert.id).title);
    }

    if (broadcast.has_status) {
      data.statuses = form.statuses;
    }

    if (broadcast.has_slot) {
      data.slot_id = form.slot_id;
      this.set('broadcastSlot', this.slotOptions.find((slot) => form.slot_id == slot.id).title);
    }

    if (broadcast.has_position) {
      data.position_id = form.position_id;
      this.set('broadcastPosition', this.positionOptions.find((p) => p.id == form.position_id).title);
      data.position_signed_up = form.position_signed_up;

    }
    if (broadcast.has_restrictions) {
      data.on_site = form.on_site ? 1 : 0;
      data.attending = form.attending ? 1 : 0;
      data.training = form.training;
    }

    data.send_sms = form.send_sms ? 1 : 0;
    data.send_email = form.send_email ? 1 : 0;
    data.send_clubhouse = form.send_clubhouse ? 1 : 0;

    return data;
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
    this.set('noPeople', false);

    const data = this._buildParams();

    this.ajax.request(`rbs/recipients`, { data })
      .then((result) => {
        this.set('people', result.people);

        if (this.people.length == 0) {
          this.set('isReviewing', false);
          this.set('noPeople', true);
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

    const data = this._buildParams();

    if (data.send_sms) {
      data.sms_message = this.broadcastForm.sms_message;
    }

    if (data.send_clubhouse || data.send_email) {
      data.subject = this.broadcastForm.subject;
      data.message = this.broadcastForm.message;
    }

    this.ajax.request('rbs/transmit', { method: 'POST', data })
      .then((result) => {
        this.set('result', result);
        this.set('didTransmit', true);
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }
}
