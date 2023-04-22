import {schedule} from '@ember/runloop';

export default function focusElement(element) {
  if (element.offsetParent !== null) {
    // Element is visible, allow the render to settle, and then focus.
    setTimeout(() => schedule('afterRender', () => element.focus()), 25);
    return;
  }

  // Element is inserted into the DOM however it is not visible yet.
  if (typeof IntersectionObserver !== "undefined") {
    // Setup to observe when the element becomes visible.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          element.focus();
          console.log('** ELEMENT FOCUSED - VIA OBSERVER');
          observer.unobserve(element);
        }
      });
    }, {root: document.documentElement});

    observer.observe(element)
  } else {
    // Delay focusing in case animation fade in/out effects are happening.
    setTimeout(() => schedule('afterRender', () => element.focus()), 300);
  }
}
