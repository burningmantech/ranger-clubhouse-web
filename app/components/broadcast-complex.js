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

import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';
import {inject as service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import validatePresenceIf from 'clubhouse/validators/presence-if';
import {Broadcasts} from 'clubhouse/constants/broadcast';
import dayjs from 'dayjs';

export default class BroadcastComplexComponent extends Component {
  @service ajax;
  @service house;

  @tracked broadcastForm;
  @tracked broadcastAlert = null;
  @tracked broadcastSlot = null;
  @tracked broadcastPosition = null;

  @tracked isReviewing = false;
  @tracked isSubmitting = false;
  @tracked didTransmit = false;


  @tracked people = null;
  @tracked noPeople = false;
  @tracked result = null;

  @tracked slotOptions = [];

  statusOptions = [
    'active',
    'alpha',
    'auditor',
    'inactive extension',
    'inactive',
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

  constructor() {
    super(...arguments);

    const defaults = Broadcasts[this.args.type];
    const message = defaults.message;
    const subject = defaults.subject;

    this.broadcastForm ={
      alert_id: '',
      attending: true,
      message: isEmpty(message) ? '' : message,
      on_site: true,
      position_id: '',
      position_signed_up: 'any',
      send_clubhouse: true,
      send_email: true,
      send_sms: true,
      slot_id: '',
      slotPositionId: null,
      statuses: ['active'],
      subject: isEmpty(subject) ? '' : subject,
      training: 'any',
    };
  }

  // Build up a validation object based on the broadcast type
  get broadcastValidations() {
    const broadcast = this.args.broadcast;

    // The basics - subject and messages
    const validations = {
      sms_message: [ validatePresenceIf({if_set: 'send_sms', message: 'Enter a text message.'}) ],
      subject: [ validatePresenceIf({if_set: ['send_clubhouse', 'send_email'], message: 'Enter a subject.'}) ],
      message: [ validatePresenceIf({if_set: ['send_clubhouse', 'send_email'], message: 'Enter a message.'}) ]
    };

    // Need to select a team/position
    if (broadcast.has_position) {
      validations.position_id = validatePresence({presence: true, message: 'Select a team'});
    }

    // Need to select a position, and then a slot
    if (broadcast.has_slot) {
      validations.slotPositionId = validatePresence({presence: true, message: 'Select a position'});
      validations.slot_id = validatePresence({presence: true, message: 'Select a shift'});
    }

    // Need to select an alert preference type
    if (broadcast.alerts) {
      validations.alert_id = validatePresence({presence: true, message: 'Choose an alert type'});
    }

    return validations;
  }

  // Build alert options
  get alertOptions() {
    const alerts = this.args.broadcast.alerts.map((alert) => {
      return [`${alert.on_playa ? "On Playa" : "Pre-Event"}: ${alert.title}`, alert.id];
    });

    alerts.unshift({id: '', title: '----'});
    return alerts;
  }

  // Build up the position options from the available slots
  get slotPositionOptions() {
    const options = this.args.broadcast.slots.map((group, idx) => {
      return {
        id: idx,
        title: group.title
      }
    });

    options.sort((a,b) => a.title.localeCompare(b.title));
    options.unshift({id: '', title: '----'});

    return options;
  }

  // Build up the basic position options
  get positionOptions() {
    const positions = this.args.broadcast.positions.slice();
    positions.sort((a,b) => a.title.localeCompare(b.title));
    positions.unshift({id: '', title: '----'});

    return positions;
  }


  @action
  positionChange(name, id, model) {
     model.slotPositionId = id;
    if (!id) {
      this.slotOptions = [];
    }

    const position = this.args.broadcast.slots[parseInt(id)];
    const slots = position.slots.map((slot) => {
      const date = dayjs(slot.begins).format('ddd MMM DD [@] HH:mm');
      return {id: slot.id, title: `${date} ${slot.description} (${slot.signed_up} sign up)`};
    });
    slots.unshift({id: '', title: '----'});

    this.slotOptions = slots;
  }

  // Build up the API params for the candidates or transmit request
  _buildParams() {
    const data = {type: this.args.type};
    const broadcast = this.args.broadcast;
    const form = this.broadcastForm;

    if (broadcast.alerts) {
      data.alert_id = form.alert_id;
      this.broadcastAlert = broadcast.alerts.find((alert) => form.alert_id == alert.id).title;
    }

    if (broadcast.has_status) {
      data.statuses = form.statuses;
    }

    if (broadcast.has_slot) {
      data.slot_id = form.slot_id;
      this.broadcastSlot = this.slotOptions.find((slot) => form.slot_id == slot.id).title;
    }

    if (broadcast.has_position) {
      data.position_id = form.position_id;
      this.broadcastPosition = this.positionOptions.find((p) => p.id == form.position_id).title;
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

    model.execute(); // commit to backing object
    this.isReviewing = true;
    this.isSubmitting = true;
    this.noPeople = false;

    const data = this._buildParams();

    this.ajax.request(`rbs/recipients`, {data})
      .then((result) => {
        this.people = result.people;

        if (!this.people.length) {
          this.isReviewing = false;
          this.noPeople = true;
        }
      }).catch((response) => {
      this.house.handleErrorResponse(response);
      // Kill the review
      this.isReviewing = false;
    })
      .finally(() => this.isSubmitting = false);
  }

  @action
  editMessageAction() {
    this.isReviewing = false;
  }

  @action
  transmitAction() {
    this.isSubmitting = true;

    const data = this._buildParams();

    if (data.send_sms) {
      data.sms_message = this.broadcastForm.sms_message;
    }

    if (data.send_clubhouse || data.send_email) {
      data.subject = this.broadcastForm.subject;
      data.message = this.broadcastForm.message;
    }

    this.ajax.request('rbs/transmit', {method: 'POST', data})
      .then((result) => {
        this.result = result;
        this.didTransmit = true;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
