import Component from '@glimmer/component';

export default class ModalMissingRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    this.data = this.args.dialog.data;
    this.hasTrainingBlocker = !this.data.training_signups_allowed;
  }
}
