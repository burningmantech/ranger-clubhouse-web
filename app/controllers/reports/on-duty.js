import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {schedule, later} from '@ember/runloop';
import validateDateTime from 'clubhouse/validators/datetime';

export default class ReportsOnDutyController extends ClubhouseController {
  @tracked expandAll = false;
  @tracked duty_date;

  queryParams = ['over_hours', 'duty_date'];

  dateValidations = {
    date: [validateDateTime({presence: true})]
  };

  @action
  submitForm(model, isValid) {
    if (!isValid) {
      return;
    }
    this.duty_date = model.date;
  }

  @action
  viewCurrentTime() {
    this.duty_date = null;
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.isExpanding = true;
    this.toggleAccordion(0);
  }

  toggleAccordion(idx) {
    schedule('afterRender', () => {
      if (idx >= this.accordions.length) {
        this.isExpanding = false;
        return;
      }
      const accordion = this.accordions[idx];
      if (!accordion) {
        return;
      }
      if (accordion.isOpen !== this.expandAll) {
        accordion.onClickAction();
      }

      later(() => schedule('afterRender', () => this.toggleAccordion(idx + 1)), 1);
    });
  }

  @action
  onAccordionInsert(accordion) {
    this.accordions.push(accordion);
  }

  @action
  onAccordionDestroy(accordion) {
    this.accordions.remove(accordion);
  }

  @action
  exportAllToCSV() {
    this._exportToCSV(this.viewPeople, 'all');
  }
}
