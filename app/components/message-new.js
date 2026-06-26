import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import PersonMessageValidations from 'clubhouse/validations/person-message';
import {SENDER_TYPE_OTHER, SENDER_TYPE_PERSON} from "clubhouse/models/person-message";
import {isEmpty} from "lodash";

const MIN_FROM_NAME_LENGTH = 5;

export default class MessageNewComponent extends Component {
  @service session;

  @tracked askForRecipient;
  @tracked askForSender;

  @tracked fromNameError;

  @tracked choice;

  // Defaults to a person message; only changed when the sender explicitly picks
  // "An Acquaintance". Declared so it can never be left undefined and clobber the
  // model's sender_type default on submit.
  @tracked senderType = SENDER_TYPE_PERSON;

  personMessageValidations = PersonMessageValidations;

  constructor() {
    super(...arguments);
    const {message} = this.args;

    if (!this.args.isContact) {
      if (this.args.isMe) {
        this.askForRecipient = true;
        this.senderType = SENDER_TYPE_PERSON;
      } else {
        this.askForSender = isEmpty(message.message_from);
        this.askForRecipient = isEmpty(message.recipient_callsign);
      }
    }
  }

  @action
  sendMessage(model, isValid) {
    if (!isValid) {
      return;
    }

    model.sender_type = this.senderType;
    this.args.sendMessage(model, true, {record: this.args.message});
  }

  @action
  selectCallsign() {
    this.choice = "callsign";
    this.senderType = SENDER_TYPE_PERSON;
  }

  @action
  selectOther() {
    this.choice = "other";
    this.senderType = SENDER_TYPE_OTHER;
  }

  @action
  selectMe() {
    this.choice = 'me';
    this.senderType = SENDER_TYPE_PERSON;
    this.args.message.message_from = this.session.user?.callsign;
  }

  @action
  confirmMe() {
    this.askForSender = false;
  }

  get choiceIsCallsign() {
    return this.choice === 'callsign';
  }

  get choiceIsOther() {
    return this.choice === 'other';
  }

  get choiceIsMe() {
    return this.choice === 'me';
  }

  @action
  senderSelected(name) {
    this.args.message.message_from = name;
    this.askForSender = false;
  }

  @action
  recipientSelected(callsign) {
    this.args.message.recipient_callsign = callsign;
    this.askForRecipient = false;
  }

  get fromNameTooShort() {
    return (this.args.message.message_from?.length ?? 0) < MIN_FROM_NAME_LENGTH;
  }

  @action
  fromNameEntered() {
    if (this.fromNameTooShort) {
      this.fromNameError = `Enter ${MIN_FROM_NAME_LENGTH} or more characters.`;
      return;
    }

    this.fromNameError = null;
    this.askForSender = false;
  }

  @action
  changeSender() {
    this.askForSender = true;
  }

  @action
  changeRecipient() {
    this.askForRecipient = true;
  }
}
