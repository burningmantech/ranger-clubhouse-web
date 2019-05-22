import { helper } from '@ember/component/helper';

const STATUSES = {
  bonked: 'B',
  pass: 'P',
  'self-bonk': 'SB'
};

export function mentorShortStatus([ status ]/*, hash*/) {
  return STATUSES[status] || status;
}

export default helper(mentorShortStatus);
