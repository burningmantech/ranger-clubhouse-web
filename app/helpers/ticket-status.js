import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

const statusLabels = {
  qualified: [ 'Available', 'text-success' ],
  banked: [ 'Banked', 'text-black-50' ],
  claimed: [ 'Claimed', 'text-success' ],
  submitted: [ 'Submitted To Ticketing', 'text-danger' ],
  expired: [ 'Expired', 'text-danger' ],
  used: [ 'Used', 'text-danger' ],
}
export function ticketStatus([ status ]/*, hash*/) {
  const label = statusLabels[status];

  if (label) {
    return htmlSafe(`<span class="${label[1]}">${label[0]}</span>`);
  }

  return `Unknown status [${status}]`;
}

export default helper(ticketStatus);
