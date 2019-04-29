import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';
import Ember from 'ember';

const escapeExpression = Ember.Handlebars.Utils.escapeExpression;

export function nl2br([ text ], hash) {
  if (isEmpty(text)) {
    return '';
  }

  if (!hash.allowHtml) {
    text = escapeExpression(text);
  }
  return htmlSafe(text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'));
}

export default helper(nl2br);
