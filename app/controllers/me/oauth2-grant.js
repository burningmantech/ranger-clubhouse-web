import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class MeOauth2GrantController extends Controller {
  @tracked status;
  @tracked client_description;
}
