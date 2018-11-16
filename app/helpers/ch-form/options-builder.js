import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { assert } from '@ember/debug';
import Ember from 'ember';

const escapeExpression = Ember.Handlebars.Utils.escapeExpression;

function buildOptions(options, currentValue) {
  let html = '', label, value;

  assert('Options list is null. Did you forget to supply the right options?', options);

  options.forEach((opt, idx) => {
    const type = typeOf(opt);
    if (type == 'object' && opt.groupName) {
        html += `<optgroup label="${escapeExpression(opt.groupName)}">${buildOptions(opt.options, currentValue)}</optgroup>`;
    } else {
      // Check for powerselect style
      if (type == 'object' && opt.id) {
        label = opt.title
        value = opt.id
      // Simple [ 'label', value ]
      } else if (type == 'array') {
        label = opt[0];
        value = opt[1];
      } else {
        // Or just [  value ]
        label = value = opt;
      }

      const isSelected = ((currentValue == null && idx == 0) || currentValue == value) ? 'selected' : '';
      html += `<option value="${value}" ${isSelected}>${escapeExpression(label)}</option>`
    }
  })

  return html;
}

export function chFormOptionsBuilder([options, currentValue]) {
  return htmlSafe(buildOptions(options, currentValue));
}

export default helper(chFormOptionsBuilder);
