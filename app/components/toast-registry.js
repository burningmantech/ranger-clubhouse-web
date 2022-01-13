import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ToastRegistryComponent extends Component {
  @service toast;
  @service session;

  get positionCss() {
    return this.session.isSmallScreen ? 'start-50 translate-middle-x' : 'end-0';
  }
}
