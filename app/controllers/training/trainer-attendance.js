import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class TrainingTrainerAttendanceController extends Controller {
  queryParams = ['year'];

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: 'Date', key: 'begins' },
      { title: 'Type', key: 'position_title' },
      { title: 'Description', key: 'description' },
      { title: 'Attended', key: 'status' }
    ];

    const rows = [];
    this.trainers.forEach((trainer) => {
      trainer.slots.forEach((slot) => {
        rows.push({
          callsign: trainer.callsign,
          begins: slot.begins,
          position_title: slot.position_title,
          description: slot.description,
          status: slot.status != '' ? slot.status : 'pending'
        });
      })
    });

    this.house.downloadCsv(`${this.year}-${this.training.title.replace(/ /g, '-')}-trainer-attendance.csv`, CSV_COLUMNS, rows);
  }
}
