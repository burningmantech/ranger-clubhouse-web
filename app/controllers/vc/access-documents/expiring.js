import Controller from '@ember/controller';

export default class VcAccessDocumentsExpiringController extends Controller {
  get emailList() {
    return this.expiring.map((person) => person.person);
  }
}
