import Component from '@glimmer/component';
import { TRAINING } from 'clubhouse/constants/positions';

export default class ModalMissingRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    this.data = this.args.dialog.data;
    this.isTraining = (+this.data.slot.position_id === TRAINING);
  }
}
