import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
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

  // Strip extra newlines from the end
  text = text.replace(/(\r\n|\r|\n){2,}$/g, '$1\n')
  return htmlSafe(text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'));
}

export default helper(nl2br);
