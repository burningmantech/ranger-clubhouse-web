import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ModalMultipleEnrollmentComponent extends Component {
  @argument(optional('object')) dialog;
  @argument(optional('object')) onClose;
  @argument(optional('object')) onConfirm;

  @service session;

  @alias('dialog.data') data;

  @alias('data.slots.firstObject.position.title') trainingType;

  @computed('data.person')
  get isMe() {
    return this.session.userId == this.data.person.id;
  }

  @computed('data.slots.firstObject')
  get isAlpha() {
    return this.data.slots.firstObject.position.title == 'Alpha';
  }
}
