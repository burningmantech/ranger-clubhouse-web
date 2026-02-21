import {helper} from '@ember/component/helper';
import {StatusColors} from 'clubhouse/models/prospective-application';

export function applicationStatusColor([status]) {
  return StatusColors[status] || status;
}

export default helper(applicationStatusColor);
