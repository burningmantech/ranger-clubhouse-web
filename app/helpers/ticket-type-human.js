import { helper } from '@ember/component/helper';
import { ticketTypeLabel } from 'clubhouse/constants/ticket-types';

export function ticketTypeHuman([ type ]/*, hash*/) {
  return ticketTypeLabel[type] || `Unknown Type ${type}`;
}

export default helper(ticketTypeHuman);
