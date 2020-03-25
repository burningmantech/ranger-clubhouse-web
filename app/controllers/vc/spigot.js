import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Date', key: 'day'},
  {title: 'Imported', key: 'imported'},
  {title: 'BMID Photo Approved', key: 'photo_approved'},
  {title: 'Online Trained', key: 'online_trained'},
  {title: 'Sign Up For Training', key: 'training_signups'},
  {title: 'Trained', key: 'training_passed'},
  {title: 'Dropped', key: 'dropped'},
  {title: 'Alpha Sign Up', key: 'alpha_signups'}
];

export default class VcSpigotController extends Controller {
  @tracked showPeople = null;

  queryParams = ['year'];

  @action
  exportToCSV(element) {
    element.preventDefault();

    // Run thru each row and build up the counts
    const data = this.model.days.map((row) => {
      const info = {};
      Object.keys(row).forEach((key) => {
        if (key == 'day') {
          // It's the day, not a count
          info.day = row[key];
        } else {
          if (row[key]) {
            // Count how many people
            info[key] = row[key].length;
          }
        }
      });
      return info;
    });
    this.house.downloadCsv(`${this.year}-spigot-flow.csv`, CSV_COLUMNS, data);
  }

  @action
  showPeopleAction(people, element) {
    element.preventDefault();
    this.showPeople = people;

  }

  @action
  closePeopleAction() {
    this.showPeople = null;
  }
}
