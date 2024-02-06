import {schedule} from '@ember/runloop';

const noIntersectionalAPI = typeof IntersectionObserver === "undefined";

function setupToFocus(element, fastFocus) {
  if (element.offsetParent === null || element.closest('.modal-dialog') || noIntersectionalAPI) {
    // The IntersectionalObserver api is not available,  the element is not visible yet, or
    // the field is on a modal dialog (and observer will not work such things)
    setTimeout(() => element.focus(), fastFocus ? 50 : 300);
    return;
  }

  // Element is inserted into the DOM however it is not visible yet.
  // Setup to observe when the element becomes visible.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        element.focus();
        observer.unobserve(element);
      }
    });
  }, {root: document.documentElement, tolerance: 0});

  observer.observe(element)
}


export default function focusElement(element, fastFocus = false) {
  schedule('afterRender', () => setupToFocus(element, fastFocus));
}

