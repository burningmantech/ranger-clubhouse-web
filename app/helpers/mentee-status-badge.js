import {helper} from '@ember/component/helper';
import {UBERBONKED} from "clubhouse/constants/person_status";
import {htmlSafe} from '@ember/template';
import {isArray} from 'lodash';

const MentorStatusLabels = {
  pending: ['secondary', 'verdict pending'],
  pass: ['success', 'mentor passed'],
  bonk: ['danger', 'mentor bonked'],
  "self-bonk": ['danger', 'self-bonked'],
  none: ['secondary', 'no alpha sign-up']
}

export function menteeStatusBadge([accountStatus, mentorStatus, alphaShifts] /*, named*/) {
  let color = '', label = '';
  if (accountStatus === UBERBONKED) {
    color = 'danger';
    label = 'UBERBONKED';
  } else if (
    (mentorStatus === 'pending' && ((isArray(alphaShifts) && !alphaShifts?.length) || !alphaShifts))
    || mentorStatus === 'none') {
    return 'no alpha sign-up';
//    [color, label] = MentorStatusLabels['none'];
  } else {
    const badge = MentorStatusLabels[mentorStatus];
    if (badge) {
      color = badge[0];
      label = badge[1];
    } else {
      color = 'warning';
      label = mentorStatus;
    }
  }

  return htmlSafe(`<span class="badge text-bg-${color}">${label}</span>`)
}

export default helper(menteeStatusBadge);

