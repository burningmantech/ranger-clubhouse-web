import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';
import {isEmpty} from 'lodash';

const TrainingStatusLabels = {
  none: ['secondary', 'no training sign-up'],
  'no pass': ['danger', 'training not passed'],
  pass: ['success', 'training passed'],
  pending: ['info', 'training pending'],
};

export function trainingStatusBadge([status] /*, named*/) {
  let color, label;

  if (status === 'none' || isEmpty(status)) {
    return 'no training sign-up'
  }

  const result = TrainingStatusLabels[status];
  if (result) {
    [color, label] = result;
  } else if (isEmpty(status)) {
    [color, label] = TrainingStatusLabels['none'];
  } else {
    color = 'warning';
    label = status;
  }
  return htmlSafe(`<span class="badge text-bg-${color}">${label}</span>`)
}

export default helper(trainingStatusBadge);
