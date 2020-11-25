import Component from '@glimmer/component';
import {action} from '@ember/object';
import $ from 'jquery';

export default class DashboardLinksComponent extends Component {
  legendBox = null;
  didCollapse = false;

  @action
  toggleIconLegend() {
    $(this.legendBox).collapse('toggle');
    this.didCollapse = true;
  }

  @action
  legendInserted(element) {
    this.legendBox = element;
  }

  @action
  willDestroyLegend(element) {
    if (this.didCollapse) {
      // Bug with the Bootstrap collapse plugin, the plugin will crash if dispose was called
      // without collapse() being called
      $(element).collapse('dispose');
    }
  }
}
