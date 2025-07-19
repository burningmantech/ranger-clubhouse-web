import {modifier} from "ember-modifier";

export default modifier((element, [callback, argument], {active}) => {
  function onClick(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    const callbackArguments = [event];
    if (argument !== undefined) {
      callbackArguments.unshift(argument);
    }

    callback(...callbackArguments);
  }


  if (active === undefined || active) {
    element.addEventListener("click", onClick);
  }

  return () => {
    element.removeEventListener("click", onClick);
  };
});
