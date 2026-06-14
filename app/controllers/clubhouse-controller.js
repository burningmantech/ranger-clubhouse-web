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
  @service analytics;
  @service download;
  @service errors;
  @service modal;
  @service router;
  @service saveModel;
  @service scroll;
  @service session;
  @service storage;
  @service storePayload;
  @service store;
  @service toast;
}

