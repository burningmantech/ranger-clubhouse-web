import Service from '@ember/service';
import {run, later} from '@ember/runloop';

/**
 * Page scroll + Bootstrap accordion control.
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

  /**
   * Scroll to an accordion and, if closed, open it
   * @param {string} id
   */

  scrollToAccordion(id) {
    if (this.openAccordion(id)) {
      // Accordion was opened, delay the scroll in case the accordion body needs to be rendered.
      setTimeout(() => {
        this.scrollToElement(`#${id}`);
      }, 350);
    } else {
      // Accordion already opened, scroll immediately.
      this.scrollToElement(`#${id}`);
    }
  }

  /**
   * Open an accordion. Return true if the accordion was previously closed.
   *
   * @param id
   * @returns {boolean}
   */
  openAccordion(id) {
    return this.toggleAccordion(id, true);
  }

  /**
   * Close up an accordion. Return true if the accordion was previously opened.
   *
   * @param id
   * @returns {boolean}
   */

  closeAccordion(id) {
    return this.toggleAccordion(id, false);
  }

  /**
   * Toggle an accordion.
   * @param id
   * @param {boolean} open
   * @returns {boolean}
   */
  toggleAccordion(id, open) {
    const accordion = document.querySelector(`#${id} .accordion-body`);
    if (open !== !!accordion?.classList.contains('show')) {
      document.querySelector(`#${id} .accordion-title`)?.click();
      return true;
    }

    return false;

  }
}
