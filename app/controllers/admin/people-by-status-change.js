import Controller from '@ember/controller';


export default class AdminPeopleByStatusChangeController extends Controller {
    queryParams = [ 'period' ];

    periodOptions = [
      [ 'Right now', 'current-date' ],
      [ 'After next event', 'next-event' ],
    ];
}
