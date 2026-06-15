import {helper} from '@ember/component/helper';
import hyperlinkText from 'clubhouse/utils/hyperlink-text';
import {isEmpty} from 'lodash';
import {htmlSafe} from '@ember/template';
import Ember from 'ember';

const escapeExpression = Ember.Handlebars.Utils.escapeExpression;

export default helper(function (positional /*, named*/) {
  const text = positional[0];

  // Escape any HTML in the (server-supplied) text BEFORE auto-linking so that
  // the result handed to htmlSafe() cannot inject markup (stored XSS).
  return !isEmpty(text) ? htmlSafe(hyperlinkText(escapeExpression(text))) : '';
});
