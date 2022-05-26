import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class ReportsCertificationsController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked haveResults = false;
  @tracked people;
  @tracked certificationsForm;
  @tracked certificationsHeader;
  @tracked certificationsById;

  @cached
  get certificationOptions() {
    return this.certifications.map((c) => [c.title, c.id]);
  }

  @action
  searchCertificationsAction() {
    const form = this.certificationsForm;
    const certification_ids = form.certificationIds;

    if (!certification_ids.length) {
      this.modal.info(null, 'No certifications were selected.');
      return;
    }

    this.isSubmitting = true;
    this.ajax.request('certification/people', {method: 'POST', data: {certification_ids}})
      .then(({people,certifications}) => {
        this.people = people;
        this.certificationsHeader = certifications;
        this.certificationsById = {};
        certifications.forEach((c) => this.certificationsById[c.id] = c);
        this.people.forEach((person) => {
          person.certifications.forEach((pc) => pc.title = this.certificationsById[pc.id].title);
        })
        this.haveResults = true;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  exportToCSV() {
    const columns = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Status', key: 'status'},
      {title: 'Name', key: 'name'},
    ];

    const isAdmin = this.session.isAdmin;

    if (this.session.canViewEmail) {
      columns.push({ title: 'Email', key: 'email'});
    }

    this.certifications.forEach((cert) => {
      columns.push({title: cert.title, key: cert.id});
        columns.push({title: 'Card/Certificate #', key: `card-${cert.id}`});
        columns.push({title: 'Issued On', key: `issued-${cert.id}`});
        columns.push({title: 'Trained On', key: `trained-${cert.id}`});
        columns.push({title: 'Notes', key: `notes-${cert.id}`});
    });

    const rows = this.people.map((person) => {
      const row = {
        callsign: person.callsign,
        name: `${person.first_name} ${person.last_name}`,
        status: person.status,
      };

      if (isAdmin) {
        row.email =  person.email;
      }

      person.certifications.forEach((pc) => {
        const cert = this.certificationsById[pc.id];
        if (pc.held) {
          row[pc.id] = cert.title;
          if (isAdmin) {
            row[`issued-${pc.id}`] = pc.issued_on;
            row[`trained-${pc.id}`] = pc.trained_on;
            row[`card-${pc.id}`] = pc.card_number;
            row[`notes-${pc.id}`] = pc.notes;
          }
        }
      });
      return row;
    });

    this.house.downloadCsv(`credentials.csv`, columns, rows);
  }
}
