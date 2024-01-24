import {schedule} from '@ember/runloop';

const noIntersectionalAPI = typeof IntersectionObserver === "undefined";

export default function focusElement(element, fastFocus = false) {
  // for whatever damn reason, the Intersection Observer is not firing for textarea elements. grr.
  if (element.offsetParent !== null || element.tagName  === 'TEXTAREA' || noIntersectionalAPI) {
    // Element is not visible, allow the render to settle, and then focus. Higher delay is used to
    // allow fade-in animation to complete.
    setTimeout(() => schedule('afterRender', () => element.focus()), fastFocus ? 50 : 300);
    return;
  }

  // Element is inserted into the DOM however it is not visible yet.
  // Setup to observe when the element becomes visible.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        element.focus();
        observer.unobserve(element);
      }
    });
  }, {root: document.documentElement});

  observer.observe(element)
}
