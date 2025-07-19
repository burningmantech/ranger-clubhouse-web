import { modifier } from 'ember-modifier';
import { later } from '@ember/runloop';

export default modifier(function autofocus(element) {
  later(() => element.focus(), 100);
});
