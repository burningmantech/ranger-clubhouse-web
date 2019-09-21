import Controller from '@ember/controller';
import { action, set } from '@ember/object';

export default class ReportsLanguagesController extends Controller {
  @action
  toggleLanguage(language) {
    set(language, 'showing', !language.showing);
  }
}
