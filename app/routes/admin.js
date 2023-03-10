import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ASSETS, EDIT_SLOTS, EDIT_SWAG, MEGAPHONE, SURVEY_MANAGEMENT} from 'clubhouse/constants/roles';

export default class AdminRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ASSETS, EDIT_SLOTS, EDIT_SWAG, MEGAPHONE, SURVEY_MANAGEMENT];
}
