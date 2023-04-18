import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Moodle Username', key: 'lms_username'},
  {title: 'Enrolled At (Pacific)', key: 'enrolled_at'},
  {title: 'Completed At (Pacific)', key: 'completed_at'},
];

export default class TrainingOnlineCourseProgressController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV() {
    return this.house.downloadCsv(`${this.year}-online-course-progress.csv`, CSV_COLUMNS, this.people);
  }
}
