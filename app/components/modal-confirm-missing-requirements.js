import Component from '@glimmer/component';

export default class ModalConfirmMissingRequirementsComponent extends Component {
  get data() {
    return this.args.dialog.data;
  }
}
