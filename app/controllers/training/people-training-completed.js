import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {later, schedule} from '@ember/runloop';
import _ from 'lodash';

const CSV_COLUMNS = [
  {title: 'Session', key: 'begins'},
  {title: 'Description', key: 'description'},
  {title: 'Trainee', key: 'callsign'},
]
export default class TrainingPeopleTrainingCompletedController extends ClubhouseController {
  queryParams = ['year'];

  @tracked year;
  @tracked slots;
  @tracked expandAll = false;
  @tracked isExpanding = false;

  accordions = [];

  @cached
  get totalTrainees() {
    return this.slots.reduce((sum, slot) => sum + slot.people.length, 0);
  }

  @cached
  get totalTrainers() {
    return this.slots.reduce((sum, slot) => sum + slot.trainers.length, 0);
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
    _.pull(this.accordions, accordion);
  }

  @action
  exportToCSV() {
    const rows = [];
    const addEmail = this.session.canViewEmail;
    const csvColumns = [...CSV_COLUMNS];
    if (addEmail) {
      csvColumns.push({title: 'Email', key: 'email'});
    }
    this.slots.forEach(slot => {
      slot.people.forEach(person => {
        const row = {
          begins: slot.slot_begins,
          description: slot.slot_description,
          callsign: person.callsign,
        };

        if (addEmail) {
          row.email = person.email;
        }
        rows.push(row);
      })
    })

    this.house.downloadCsv(`${this.year}-training-completed`, csvColumns, rows);
  }
}
