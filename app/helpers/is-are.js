import { helper } from '@ember/component/helper';

export default helper(function isAre([ length, singular, plural ] /*, named*/) {
  return (+length === 1) ? (singular ?? 'is') : (plural ?? 'are');
});
