import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class VcAccessDocumentsExpiringController extends Controller {
  @computed('expiring')
  get emailList() {
    return this.expiring.map((person) => person.person);
  }
}
