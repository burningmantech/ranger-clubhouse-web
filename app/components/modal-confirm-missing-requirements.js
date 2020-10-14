import Component from '@glimmer/component';
import { alias } from '@ember/object/computed';

export default class ModalConfirmMissingRequirementsComponent extends Component {
  @alias('args.dialog.data') data;

}
