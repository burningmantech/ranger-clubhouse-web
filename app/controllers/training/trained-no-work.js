import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {key: 'callsign', label: 'Person'},
  {key: 'status', label: 'Status'},
]
export default class TrainingTrainedNoWorkController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV() {
    this.house.downloadCsv(`${this.year}-trained-no-work.csv`, CSV_COLUMNS, this.people);
  }
}
