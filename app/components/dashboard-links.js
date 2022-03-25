import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class DashboardLinksComponent extends Component {
  @tracked hideLegend = true;

  @action
  toggleIconLegend() {
    this.hideLegend = !this.hideLegend;
  }
}
