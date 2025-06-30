import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class AdminSlotsTable extends Component {
  @action
  parentSlot(slot) {
    return this.args.slotsById[slot.parent_signup_slot_id];
  }

  @action
  childSlot(slot) {
    return this.args.childrenByParentId[slot.id];
  }
}
