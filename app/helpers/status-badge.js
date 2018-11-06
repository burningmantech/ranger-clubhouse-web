import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';
import * as PersonStatus from 'clubhouse/constants/person_status';

export function statusBadge([ status ]) {
  let color;

  switch (status) {
  case PersonStatus.PROSPECTIVE:
  case PersonStatus.PROSPECTIVE_WAITLIST:
  case PersonStatus.ALPHA:
    color = 'info';
    break;


  case PersonStatus.BONKED:
  case PersonStatus.UBERBONKED:
  case PersonStatus.DISMISSED:
    color = 'danger';
    break;

  case PersonStatus.ACTIVE:
  case PersonStatus.AUDITOR:
    color = 'secondary';
    break;

  default:
    color = 'warning';
    break;
  }
  return htmlSafe(`<span class="badge badge-${color}">${status}</span>`);
}

export default helper(statusBadge);
