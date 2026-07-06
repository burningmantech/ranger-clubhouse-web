import Component from '@glimmer/component';
import {IN_PREP} from "clubhouse/models/bmid";
import {cached} from '@glimmer/tracking';

export default class BmidViewRowComponent extends Component {
  @cached
  get rowColor() {
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
