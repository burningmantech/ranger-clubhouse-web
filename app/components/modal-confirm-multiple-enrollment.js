import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class ModalConfirmMultipleEnrollmentComponent extends Component {
  @service session;

  @alias('args.dialog.data') data;

  @alias('args.data.slots.firstObject.position.title') trainingType;

  @computed('data.person.id', 'session.userId')
  get isMe() {
    return this.session.userId == this.data.person.id;
  }

  @computed('data.slots.firstObject.position.title')
  get isAlpha() {
    return this.data.slots.firstObject.position.title == 'Alpha';
  }
}
