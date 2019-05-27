import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class ErrorController extends Controller {
  @action
  reload() {
    location.reload(false);
  }
}
