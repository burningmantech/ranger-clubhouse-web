import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

export function trainingPassBadge([passed] /*, named*/) {
  let color, label;
  if (passed) {
    color = 'success';
    label = 'passed';
  } else {
    color = 'danger';
    label = 'not passed';
  }
  return htmlSafe(`<span class="badge text-bg-${color}">training ${label}</span>`)
}

export default helper(trainingPassBadge);
