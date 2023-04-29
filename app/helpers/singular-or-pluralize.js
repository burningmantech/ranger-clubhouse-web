import {helper} from '@ember/component/helper';
import {pluralize} from 'ember-inflector';

export default helper(function singularOrPluralize(positional, {capitalize}) {
  const [count, word] = positional;

  if (count === 1) {
    let prefix;
    if (word.match(/^[aeiou]/i)) {
      prefix = capitalize ? 'An' : 'an';
    } else {
      prefix = capitalize ? 'A' : 'a';
    }
    return `${prefix} ${word}`;
  } else {
    return pluralize(count, word);
  }
});
