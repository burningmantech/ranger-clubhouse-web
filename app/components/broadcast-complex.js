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
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';
import {service} from '@ember/service';
import {validatePresence, validateLength} from 'ember-changeset-validations/validators';
import validatePresenceIf from 'clubhouse/validators/presence-if';
import {Broadcasts} from 'clubhouse/constants/broadcast';
import dayjs from 'dayjs';
import {
  ACTIVE,
  ALPHA,
  AUDITOR,
  INACTIVE,
  INACTIVE_EXTENSION,
  PROSPECTIVE,
  RETIRED
} from "clubhouse/constants/person_status";
import {buildBroadcastOptions} from "clubhouse/utils/build-broadcast-options";
import validateDateTime from "clubhouse/validators/datetime";

export default class BroadcastComplexComponent extends Component {
  @service ajax;
  @service house;

  @tracked broadcastForm;
  @tracked broadcastAlert = null;
  @tracked broadcastSlot = null;
  @tracked broadcastPositions = null;

  @tracked isReviewing = false;
  @tracked isSubmitting = false;
  @tracked didTransmit = false;


  @tracked people = null;
  @tracked noPeople = false;
  @tracked result = null;

  @tracked slotOptions = [];

  statusOptions = [
    ACTIVE,
    ALPHA,
    AUDITOR,
    INACTIVE,
    INACTIVE_EXTENSION,
    PROSPECTIVE,
    RETIRED,
  ];

  signedUpOptions = [
    ['Who are signed up for a position shift', 'signed-up'],
    ['Who are NOT signed up for a position shift', 'not-signed-up'],
    ['Who have the position(s) and does not matter if they are signed up or not', 'any']
  ];

  trainingOptions = [
    ['Does not matter if they are In-Person Trained or not', 'any'],
    ['Who have passed In-Person Training', 'passed'],
    ['Who are signed up for OR passed In-Person Training', 'registered'],
    ['Who are NOT signed up for In-Person Training', 'no-training']
  ];

  constructor() {
    super(...arguments);

    const defaults = Broadcasts[this.args.type];
    const message = defaults.message;
    const subject = defaults.subject;

    this.broadcastForm = EmberObject.create({
      alert_id: '',
      attending: true,
      message: isEmpty(message) ? '' : message,
      on_site: true,
      position_ids: [],
      position_signed_up: 'any',
      send_clubhouse: true,
      send_email: true,
      send_sms: true,
      slot_id: '',
      slotPositionId: null,
      statuses: [ACTIVE],
      subject: isEmpty(subject) ? '' : subject,
      training: 'any',
      expires_at: dayjs().add(12, 'h').format('YYYY-MM-DD HH:mm'),
    });

    if (this.args.broadcast.has_position) {
      this.positionOptions = buildBroadcastOptions(this.args.broadcast.positions);
    }
  }

  // Build up a validation object based on the broadcast type
  get broadcastValidations() {
    const broadcast = this.args.broadcast;

    // The basics - subject and messages
    const validations = {
      sms_message: [validatePresenceIf({if_set: 'send_sms', message: 'Enter a text message.'})],
      subject: [validatePresenceIf({if_set: ['send_clubhouse', 'send_email'], message: 'Enter a subject.'})],
      message: [validatePresenceIf({if_set: ['send_clubhouse', 'send_email'], message: 'Enter a message.'})],
      expires_at: [validatePresence(true), validateDateTime()]
    };

    // Need to select a team/position
    if (broadcast.has_position) {
      validations.position_ids = [validateLength({min: 1, message: 'Select one ore more positions'})];
    }

    // Need to select a position, and then a slot
    if (broadcast.has_slot) {
      validations.slotPositionId = [validatePresence({presence: true, message: 'Select a position'})];
      validations.slot_id = [validatePresence({presence: true, message: 'Select a shift'})];
    }

    // Need to select an alert preference type
    if (broadcast.alerts) {
      validations.alert_id = [validatePresence({presence: true, message: 'Choose an alert type'})];
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

    options.sort((a, b) => a.title.localeCompare(b.title));
    options.unshift({id: '', title: '----'});

    return options;
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
      data.position_ids = form.position_ids;
      this.broadcastPositions = broadcast.positions.filter((p) => form.position_ids.includes(p.id.toString())).map((p) => p.title);
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
    if (form.expires_at) {
      data.expires_at = form.expires_at;
    }

    return data;
  }

  @action
  async reviewAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.execute(); // commit to backing object

    this.isReviewing = true;
    this.isSubmitting = true;
    this.noPeople = false;

    const data = this._buildParams();

    try {
      const {people} = await this.ajax.request(`rbs/recipients`, {data});
      this.people = people;

      if (!this.people.length) {
        this.isReviewing = false;
        this.noPeople = true;
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
    this.isSubmitting = true;

    const data = this._buildParams();

    if (data.send_sms) {
      data.sms_message = this.broadcastForm.sms_message;
    }

    if (data.send_clubhouse || data.send_email) {
      data.subject = this.broadcastForm.subject;
      data.message = this.broadcastForm.message;
    }

    try {
      this.result = await this.ajax.request('rbs/transmit', {method: 'POST', data});
      this.didTransmit = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
