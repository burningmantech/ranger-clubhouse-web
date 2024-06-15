import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import { action } from '@ember/object';

class Certification {
  @tracked selected = false;
  @tracked notes = '';
  @tracked issued_on = '';
  @tracked trained_on = '';
  @tracked card_number = '';

  constructor(cert) {
    this.title = cert.title;
    this.id = cert.id;
  }
}

export default class PersonRoleFormComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @tracked isLoading = false;
  @tracked certifications;


  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.ajax.request('certification').then(({certification}) => {
      const {personCertifications} = this.args;

      this.certifications = certification.map((cert) => {
        const existing = personCertifications.find((c) => c.certification_id === cert.id);
        const record = new Certification(cert);
        if (existing) {
          record.selected = true;
          record.notes = existing.notes;
          record.issued_on = existing.issued_on;
          record.trained_on = existing.trained_on;
          record.card_number = existing.card_number;
        }
        return record;
      });
      this.isLoading = false;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  submitAction(event){
    // Prevent enter from causing a submit.
    event.stopPropagation();
  }

  @action
  saveAction() {
    this.args.onSave(this.certifications);
  }

  @action
  updateColumn(cert, column, value) {
    cert[column] = value;
  }

  @action
  notesInputEvent(cert, event) {
    cert.notes = event.target.value;
  }
}
