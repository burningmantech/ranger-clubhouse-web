import {modifier} from "ember-modifier";

export default modifier((element, positional, {active}) => {
  function onClick(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    // make a copy because EmberJS passes down an immutable positional argument.
    const [callback, ...rest] = positional;
    const callbackArguments = [...rest, event];

    callback(...callbackArguments);
  }

  if (active === undefined || active) {
    element.addEventListener("click", onClick);
  }

  return () => {
    element.removeEventListener("click", onClick);
  };
});
