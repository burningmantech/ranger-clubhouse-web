import Helper from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

const TRAINING_STATUSES = {
  pending: {
    text: 'Pending',
    color: 'warning'
  },
  pass: {
    text: 'Passed',
    color: 'success'
  },
  fail: {
    text: 'Failed',
    color: 'danger'
  },
  'no-shift': {
    text: 'No Training Shift Found',
    color: 'danger'
  }
};


export default Helper.extend({
  compute([status]) {
    const info = TRAINING_STATUSES[status];
    let color,
      text;

    if (info) {
      text = info.text;
      color = info.color;
    } else {
      text = `Unknown status [${status}]`;
      color = 'danger';
    }

    return htmlSafe(`<span class="badge badge-${color}">${text}</span>`)
  }
});
