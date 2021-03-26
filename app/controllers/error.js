import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
export default class ErrorController extends ClubhouseController {
  @action
  reload() {
    location.reload(false);
  }
}
