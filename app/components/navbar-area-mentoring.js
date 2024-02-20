import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class NavbarAreaMentoringComponent extends Component {
  @service session;

  get isGroundhogDayServer() {
    return this.session.isGroundhogDayServer;
  }
}
