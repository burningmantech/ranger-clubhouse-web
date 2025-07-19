import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import PersonMessageValidations from 'clubhouse/validations/person-message';
import {SENDER_TYPE_OTHER, SENDER_TYPE_PERSON} from "clubhouse/models/person-message";
import {isEmpty} from "lodash";

export default class MessageNewComponent extends Component {
  @service session;

  @tracked askForRecipient;
  @tracked askForSender;

  @tracked fromNameError;

  @tracked choice;

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
    this.args.sendMessage(model, true, null, null, this.args.message);
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
    this.args.message.message_from = this.session.user.callsign;
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

  @action
  fromNameEntered() {
    if (this.fromName?.length < 5) {
      this.fromNameError = "Enter 5 or more characters.";
      return;
    }

    this.askForSender = false;
  }

  @action
  updateMessageFrom(event) {
    this.args.message.message_from = event.target.value;
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
