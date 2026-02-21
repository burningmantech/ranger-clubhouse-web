import {helper} from '@ember/component/helper';
import {StatusLabels} from 'clubhouse/models/prospective-application';

export function applicationStatusLabel([status]) {
  return StatusLabels[status] ?? `Bug: ${status}`;
}

export default helper(applicationStatusLabel);
