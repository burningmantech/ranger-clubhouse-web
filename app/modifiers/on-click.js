import {modifier} from 'ember-modifier';

export default modifier(function onClick(element, [callback, ...args]/*, named*/) {
  function handleClick(event) {
    event.preventDefault();
    callback(...args, event);
  }

  element.addEventListener("click", handleClick);

  return () => {
    element.removeEventListener("click", handleClick);
  };
});
