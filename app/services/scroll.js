import Service from '@ember/service';
import {run, later} from '@ember/runloop';

/**
 * Page scroll control.
 */

export default class ScrollService extends Service {
  /**
   * Scroll to top
   */

  scrollToTop(instance = false) {
    run('afterRender', () => window.scrollTo({top: 0, left: 0, behavior: instance ? 'instant' : 'smooth'}));
  }

  /**
   * Scroll to element
   *
   * @param {string} selector Element ID to scroll to
   * @param instance
   */

  scrollToElement(selector, instance = false) {
    later(() => {
      const behavior = instance ? 'instant' : 'smooth';
      const element = (selector instanceof Element) ? selector : document.querySelector(selector);
      if (!element) {
        return;
      }

      const {top, bottom} = element.getBoundingClientRect();
      const isModal = element.closest('.modal');
       if (isModal || bottom > window.innerHeight || top < 0) {
        element.scrollIntoView({behavior});
      } else {
        // Element is already in view, scroll element mostly to the top.
        window.scroll({top: top + window.scrollY - 100, behavior});
      }
    }, 100);
  }
}
