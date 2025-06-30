import {helper} from '@ember/component/helper';
import hyperlinkText from 'clubhouse/utils/hyperlink-text';
import {isEmpty} from 'lodash';
import {htmlSafe} from '@ember/template';

export default helper(function (positional /*, named*/) {
  const text = positional[0];

  return !isEmpty(text) ? htmlSafe(hyperlinkText(text)) : '';
});
