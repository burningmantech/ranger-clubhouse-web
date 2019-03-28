import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

export default class ModalSiteLeaveComponent extends Component {
  @argument(optional('string')) title;
  @argument(optional('object')) dialog;
  @argument(optional('object')) onClose;
  @argument(optional('object')) onConfirm;

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
