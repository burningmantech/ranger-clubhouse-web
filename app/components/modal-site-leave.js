import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';



export default class ModalSiteLeaveComponent extends Component {
  title = null;
  dialog = null;
  onClose = null;
  onConfirm = null;

  @alias('dialog.data.isOnDuty') isOnDuty;
  @alias('dialog.data.unverifiedTimesheetCount') unverifiedTimesheetCount;
  @alias('dialog.data.assetsCheckedOut') assetsCheckedOut;

  @computed('dialog.data')
  get pendingItems() {
    let items = 0;

    if (this.isOnDuty) {
        items++;
    }

    if (this.unverifiedTimesheetCount) {
      items++;
    }

    if (this.assetsCheckedOut.length) {
      items++;
    }

    return items++;
  }

}
