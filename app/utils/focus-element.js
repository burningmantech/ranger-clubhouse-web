import {schedule} from '@ember/runloop';

export default function focusElement(element, fastFocus = false) {
  if (element.offsetParent !== null || typeof IntersectionObserver === "undefined") {
    // Element is visible, allow the render to settle, and then focus.
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
