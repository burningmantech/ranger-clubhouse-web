import { modifier } from 'ember-modifier';

export default modifier(function onInsert(element, [ callback ]) {
  callback(element);
});
