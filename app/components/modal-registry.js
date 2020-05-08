import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ModalRegistryComponent extends Component {
  @service modal;
}
