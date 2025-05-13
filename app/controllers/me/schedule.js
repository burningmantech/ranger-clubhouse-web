import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';

export default class MeScheduleController extends ClubhouseController {
  @tracked permission;
  @tracked credits_earned;
  @tracked scheduleSummary;

}
