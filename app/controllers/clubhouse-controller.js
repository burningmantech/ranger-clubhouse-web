import Controller from '@ember/controller';
import { service } from '@ember/service';

/**
 * Base Clubhouse Controller
 *
 * Exists to inject the various services used by the controllers
 *
 */

export default class ClubhouseController extends Controller {
  @service ajax;
  @service house;
  @service modal;
  @service router;
  @service session;
  @service store;
  @service toast;
}

