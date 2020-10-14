import Component from '@glimmer/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import * as Position from 'clubhouse/constants/positions';

export default class ModalMultipleEnrollmentComponent extends Component {
  @service session;

  @alias('args.dialog.data') data;
  @alias('data.person') person;

  @alias('data.enrolledSlots') enrolledSlots;

  @alias('data.slot') slot;
  @alias('data.slot.position_title') trainingType;

  get isMe() {
    return this.session.userId == this.person.id;
  }

  get isAlpha() {
    return this.slot.position_id == Position.ALPHA;
  }
}
