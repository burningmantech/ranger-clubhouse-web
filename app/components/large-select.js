import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class LargeSelectComponent extends Component {
  @tracked showDialog = false;
  @tracked optionSelected = null;

  @cached
  get selectedLabel() {
    const {selected} = this.args;

    if (selected) {
      const {formatSelected} = this.args;
      return formatSelected ? formatSelected(selected) : selected;
    }

    return 'None selected yet';
  }

  @cached
  get label() {
    return this.args.label ?? 'Select an option';
  }

  @action
  openDialogAction() {
    this.showDialog = true;
  }

  @action
  cancelAction() {
    this.showDialog = false;
  }

  @action
  selectAction(option) {
    if (this.optionSelected) {
      this.optionSelected.selected = false;
    }

    this.optionSelected = option;
    this.optionSelected.selected = true;

    this.args.onSelect(option);
    this.showDialog = false;
  }
}
