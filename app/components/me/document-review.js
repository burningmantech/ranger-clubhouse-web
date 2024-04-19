import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {DEPT_NDA_TAG} from "clubhouse/models/document";
import {htmlSafe} from '@ember/template';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class MeDocumentReviewComponent extends Component {
  @tracked agreement;
  @tracked isLoading = true;
  @tracked isSubmitting = false;
  @tracked didSign = false;
  @tracked notAvailable = false;
  @tracked bodyText;

  @service ajax;
  @service house;
  @service session;

  constructor() {
    super(...arguments);
    this._loadDocument();
  }

  async _loadDocument() {
    try {
      this.agreement = await this.ajax.request(`agreements/${this.session.userId}/${this.args.tag}`);
      this.notAvailable = this.agreement.status === 'not-available';
      if (!this.notAvailable) {
        this.bodyText = htmlSafe(this.agreement.text);
        this.didSign = this.agreement.signature;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async signDocument() {
    this.isSubmitting = true;
    try {
      await this.ajax.request(`agreements/${this.session.userId}/${this.agreement.tag}/sign`, {
        method: 'POST',
        data: {signature: 1}
      });
      this.didSign = true;
      if (this.agreement.tag === DEPT_NDA_TAG) {
        // Signing the NDA reactivates all roles.
        this.session.loadUser();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
