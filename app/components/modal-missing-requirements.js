import Component from '@glimmer/component';
import { alias } from '@ember/object/computed';
import { TRAINING } from 'clubhouse/constants/positions';

export default class ModalMissingRequirementsComponent extends Component {
  @alias('args.dialog.data') data;

   get isTraining() {
    return this.data.slot.position_id == TRAINING;
  }
}
