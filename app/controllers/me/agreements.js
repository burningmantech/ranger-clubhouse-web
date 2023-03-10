import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked }from '@glimmer/tracking';
import { action }from '@ember/object';

export default class MeAgreementsController extends ClubhouseController {
  @tracked showAgreement;

  @action
  reviewAgreement(agreement) {
    this.showAgreement = agreement;
  }

  @action
  closeAgreement(signed) {
    this.showAgreement.signed = signed;
    this.showAgreement = null;
  }
}
