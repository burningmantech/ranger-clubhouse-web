import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';

export default class ReportsLanguagesController extends ClubhouseController {
  @action
  toggleLanguage(language) {
    set(language, 'showing', !language.showing);
  }
}
