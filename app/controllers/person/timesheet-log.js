import Controller from '@ember/controller';

export default class PersonTimesheetLogController extends Controller {
  queryParams = [ 'year' ];

  actionLabels = {
    'signon': 'Shift started',
    'signoff': 'Shift ended',
    'update': 'Updated',
    'delete': 'Deleted',
    'confirmed': 'Entire timesheet confirmed',
    'unconfirmed': 'Entire timesheet unconfirmed',
    'unverified': 'Unverified',
    'verify': 'Verified',
    'created': 'Created'
  };
}
