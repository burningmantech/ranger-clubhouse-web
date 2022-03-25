import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PopoverComponent extends Component {
  @action
  preventClick(e) {
    e.preventDefault();
  }
}
