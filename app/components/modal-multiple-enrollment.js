import Component from '@glimmer/component';
import { service } from '@ember/service';
import { ALPHA } from 'clubhouse/constants/positions';

export default class ModalMultipleEnrollmentComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);

    this.data = this.args.dialog.data;
    this.person = this.data.person;
    this.enrolledSlots = this.data.enrolledSlots;
    this.slot = this.data.slot;
    this.isMe = (this.session.userId === +this.person.id);
    this.isAlpha = (+this.slot.position_id === ALPHA);
    this.traininType = this.data.slot.position_title;
  }
}
