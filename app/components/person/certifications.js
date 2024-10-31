import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {ADMIN, CERTIFICATION_MGMT} from 'clubhouse/constants/roles';

export default class PersonCertificationsComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service store;
  @service toast;

  @tracked editEntry = null;
  @tracked showEntry = null;
  @tracked isLoading = true;
  @tracked certifications;
  @tracked personCertifications;
  @tracked certificationOptions;

  @tracked frontBlob;
  @tracked backBlob;

  validations = {
    certification_id: [validatePresence(true)]
  };

  constructor() {
    super(...arguments);

    this.canManage = this.session.hasRole([ADMIN, CERTIFICATION_MGMT]);
    this._loadRecords();
  }

  async _loadRecords() {
    const {personId} = this.args;
    try {
      const certs = await this.store.query('person-certification', {person_id: personId});
      this.personCertifications = certs;
      const {certification} = await this.ajax.request('certification');
      this.certifications = certification;
      this.certificationOptions = certification.map((c) => [c.title, c.id]);
      this.certificationOptions.unshift({id: null, title: 'Select Certification', disabled: true});
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  newAction() {
    this.editEntry = this.store.createRecord('person-certification', {
      person_id: this.args.personId,
      certification_id: this.certifications[0]?.id,
    });
    this.frontBlob = null;
    this.backBlob = null;
  }

  @action
  cancelAction() {
    this.editEntry = null;
  }

  @action
  editAction(cert) {
    this.editEntry = cert;
    this.frontBlob = null;
    this.backBlob = null;
  }

  @action
  deleteAction() {
    this.modal.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete ${this.editEntry.certification.title}?`,
      () => {
        this.editEntry.destroyRecord()
          .catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.editEntry = null);
      });
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    const {isNew} = model;
    model.save().then(() => {
      this.editEntry = null;
      this.toast.success(`Certification was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.personCertifications.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response))
  }

  @action
  showAction(cert) {
    this.showEntry = cert;
  }

  @action
  closeShowAction() {
    this.showEntry = null;
  }
}
