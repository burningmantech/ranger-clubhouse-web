import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';


export default class AdminPeopleByStatusChangeController extends ClubhouseController {
    queryParams = [ 'period' ];

    periodOptions = [
      [ 'Right now', 'current-date' ],
      [ 'After next event', 'next-event' ],
    ];

    get isCurrentPeriod() {
      return this.period === 'current-date';
    }
}
