import Component from '@glimmer/component';
import {IN_PREP} from "clubhouse/models/bmid";
import {action} from '@ember/object';

export default class BmidViewRowComponent extends Component {
  @action
  rowColor() {
    const {bmid} = this.args;

    if (!bmid.has_approved_photo) {
      return 'table-danger';
    }

    if (bmid.notQualifiedToPrint && bmid.status === IN_PREP) {
      return 'table-warning';
    }

    return '';
  }
}
