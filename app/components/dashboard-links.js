import Component from '@glimmer/component';
import {action} from '@ember/object';
import { inject as service } from '@ember/service';

export default class DashboardLinksComponent extends Component {
  @service house;

  legendBox = null;
  didCollapse = false;

  @action
  toggleIconLegend() {
    this.house.collapse(this.legendBox, 'toggle');
    this.didCollapse = true;
  }

  @action
  legendInserted(element) {
    this.legendBox = element;
  }

  @action
  willDestroyLegend() {
    if (this.didCollapse) {
      // Bug with the Bootstrap collapse plugin, the plugin will crash if dispose was called
      // without collapse() being called
      this.house.collapse(this.legendBox, 'dispose');
    }
  }
}
