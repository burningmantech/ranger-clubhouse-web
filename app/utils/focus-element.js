import {schedule} from '@ember/runloop';

export default function focusElement(element) {
  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          element.focus();
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
