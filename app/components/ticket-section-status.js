import Component from '@glimmer/component';
import {QUALIFIED, BANKED, SUBMITTED, CLAIMED} from 'clubhouse/models/access-document';

const STATUSES = {
  [QUALIFIED]: {text: 'Available', color: 'success'},
  [BANKED]: {text: 'BANKED', color: 'muted'},
  [SUBMITTED]: {text: 'SUBMITTED', color: 'danger'},
  [CLAIMED]: {text: 'Claimed', color: 'success', icon: 'check'},
  'none': { text: 'NONE', color: 'muted'},
  'need-answer': { text: 'NEED ANSWER', color: 'danger', icon: 'exclamation-circle'}
}
export default class TicketSectionStatusComponent extends Component {
  get statusColor() {
    return STATUSES[this.args.status].color;
  }

  get statusText() {
    return this.args.text ?? STATUSES[this.args.status].text;
  }

  get statusIcon() {
    return STATUSES[this.args.status].icon;
  }
}
