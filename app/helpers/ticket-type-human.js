import { helper } from '@ember/component/helper';

const typeHuman = {
  staff_credential:     'Staff Credential',
  reduced_price_ticket: 'Reduced-Price Ticket',
  gift_ticket:          'Gift Ticket',
  work_access_pass:     'Work Access Pass',
  work_access_pass_so:  'Work Access Pass (SO)',
  vehicle_pass:         'Vehicle Pass',
};

export function ticketTypeHuman([ type ]/*, hash*/) {
  return typeHuman[type] || `Unknown Type ${type}`;
}

export default helper(ticketTypeHuman);
