import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

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

export default class VcSpigotController extends ClubhouseController {
  @tracked showPeople = null;

  queryParams = ['year'];

  @action
  exportToCSV() {
    // Run thru each row and build up the counts
    const data = this.model.days.map((row) => {
      const info = {};
      Object.keys(row).forEach((key) => {
        if (key === 'day') {
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

  @cached
  get totals() {
    let imported = 0, photo_approved = 0, online_trained = 0, training_signups = 0,
      training_passed = 0, dropped = 0, alpha_signups = 0;

    this.model.days.forEach((day) => {
      console.log(' DAY ', day);
      imported += day.imported?.length ?? 0;
      photo_approved += day.photo_approved?.length ?? 0;
      online_trained += day.online_trained?.length ?? 0;
      training_signups += day.training_signups?.length ?? 0;
      training_passed += day.training_passed?.length ?? 0;
      dropped += day.dropped?.length ?? 0;
      alpha_signups += day.alpha_signups?.length ?? 0;
    });

    return {
      imported, photo_approved, online_trained, training_signups, training_passed, dropped, alpha_signups
    };
  }
}
