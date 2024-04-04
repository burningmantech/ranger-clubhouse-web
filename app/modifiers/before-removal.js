import { modifier } from 'ember-modifier';

export default modifier(function beforeRemoval(element, positional/*, named*/) {
    return () => {
      positional[0]?.(element);
    }
});
