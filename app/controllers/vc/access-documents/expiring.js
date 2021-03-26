import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class VcAccessDocumentsExpiringController extends ClubhouseController {
  get emailList() {
    return this.expiring.map((person) => person.person);
  }
}
