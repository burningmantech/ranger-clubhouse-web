import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {
  ADMIN,
  ANNOUNCEMENT_MANAGEMENT,
  EDIT_ASSETS,
  EDIT_SLOTS,
  EDIT_SWAG,
  MEGAPHONE, MEGAPHONE_EMERGENCY_ONPLAYA, MEGAPHONE_TEAM_ONPLAYA,
  SURVEY_MANAGEMENT,
  TIMESHEET_MANAGEMENT
} from 'clubhouse/constants/roles';

export default class AdminRoute extends ClubhouseRoute {
  roleRequired = [
    ADMIN,
    ANNOUNCEMENT_MANAGEMENT,
    EDIT_ASSETS,
    EDIT_SLOTS,
    EDIT_SWAG,
    MEGAPHONE,
    MEGAPHONE_EMERGENCY_ONPLAYA,
    MEGAPHONE_TEAM_ONPLAYA,
    SURVEY_MANAGEMENT,
    TIMESHEET_MANAGEMENT
  ];
}
