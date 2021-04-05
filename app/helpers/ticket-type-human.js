import { helper } from '@ember/component/helper';
import { TypeLabels } from 'clubhouse/models/access-document';

export function ticketTypeHuman([ type ]) {
  return TypeLabels[type] || `Unknown Type ${type}`;
}

export default helper(ticketTypeHuman);
