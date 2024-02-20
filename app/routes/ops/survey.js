import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, SURVEY_MANAGEMENT } from 'clubhouse/constants/roles';

export default class OpsSurveyRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, SURVEY_MANAGEMENT];
}
