import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class ReportsRadioCheckoutController extends ClubhouseController {
  queryParams = ['year', 'include_qualified', 'event_summary'];
}
