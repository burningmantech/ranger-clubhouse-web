import Component from '@glimmer/component';

export default class ModalConfirmMissingRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    this.hasTrainingBlocker = !this.data.training_signups_allowed;

  }

  get data() {
    return this.args.dialog.data;
  }
}
