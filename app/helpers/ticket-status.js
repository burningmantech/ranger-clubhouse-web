import { helper } from '@ember/component/helper';

const statusLabels = {
  qualified: 'Available',
  banked: 'Banked',
  claimed: 'Claimed',
  submitted: 'Submitted To Ticketing',
  expired: 'Expired',
  used: 'Used',
}
export function ticketStatus([ status ]/*, hash*/) {
  const label = statusLabels[status];

  if (label) {
    return label;
  }

  return `Unknown status [${status}]`;
}

export default helper(ticketStatus);
