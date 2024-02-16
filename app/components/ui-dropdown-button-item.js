import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class UiDropdownButtonItemComponent extends Component {
  @action
  onSelect(closeMenu) {
    closeMenu?.();
    this.args.onSelect();
  }
}
