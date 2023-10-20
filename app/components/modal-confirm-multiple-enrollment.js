import Component from '@glimmer/component';
import {service} from '@ember/service';
import _ from 'lodash';

export default class ModalConfirmMultipleEnrollmentComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);
    this.data = this.args.dialog.data;
    this.isMe = (this.session.userId == this.data.person.id);
    this.isAlpha = false;
    this.trainingType = _.first(this.data.slots).position.title
    switch (this.trainingType) {
      case 'Alpha':
        this.isAlpha = true;
        this.shiftType = 'Alpha shift';
        break;
      case 'Training':
        this.isAlpha = false;
        this.shiftType = 'training';
        break;
      default:
        this.isAlpha = false;
        this.shiftType = 'shift';
        break;
    }
  }
}
