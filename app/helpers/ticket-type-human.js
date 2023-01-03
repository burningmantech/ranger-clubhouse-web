import { helper } from '@ember/component/helper';
import { TypeLabels, TypeShortLabels} from 'clubhouse/models/access-document';

export function ticketTypeHuman([ type ], { short }) {
  return (short ? TypeShortLabels[type] : TypeLabels[type]) || `Unknown Type ${type}`;
}

export default helper(ticketTypeHuman);
