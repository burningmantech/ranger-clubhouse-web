import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class MeAgreementsController extends ClubhouseController {
  @tracked showAgreementForSigning;
  @tracked showAgreementToView;

  @action
  reviewAgreementToSign(agreement) {
    this.showAgreementForSigning = agreement;
  }

  @action
  closeAgreementToSign(signed) {
    this.showAgreementForSigning.signed = signed;
    this.showAgreementForSigning = null;
  }

  @action
  showAgreement(agreement) {
    this.showAgreementToView = agreement;
  }

  @action
  closeAgreementView() {
    this.showAgreementToView = null;
  }
}
