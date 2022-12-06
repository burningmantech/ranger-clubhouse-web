import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {TypeLabels as ProvisionLabels} from 'clubhouse/models/provision';
import {TypeLabels as TicketLabels} from 'clubhouse/models/access-document';

import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Ticket', key: 'ticket_label'},
  {title: 'BMID Printed?', key: 'bmid', yesno: true},
  {title: 'Has Signups?', key: 'signed_up', yesno: true},
  {title: 'Provisions', key: 'provisions_list'}
];

export default class VcAccessDocumentsUnsubmitProvisionsController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked people;

  @action
  provisionTypeHuman(provision) {
    return ProvisionLabels[provision.type] || provision.type;
  }

  @action
  unsubmitAction() {
    const people_ids = this.people.filter((p) => p.selected).map((p) => p.id);

    if (!people_ids.length) {
      this.modal.info('No people selected', 'No one was selected to un-submit their provisions');
      return;
    }

    this.isSubmitting = true;
    this.ajax.request('provision/unsubmit-provisions', {method: 'POST', data: {people_ids}})
      .then(() => {
        people_ids.forEach((id) => {
          const person = this.people.find((p) => p.id === id);
          if (person) {
            person.selected = false;
            person.didUnsubmit = true;
          }
        })
        this.toast.success('Provisions successfully un-submitted.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  exportToCSV() {
    const rows = this.people.map((person) => ({
      ...person,
      ticket_label: person.ticket ? (TicketLabels[person.ticket.type] || person.ticket.type) : '-',
      provisions_list: person.provisions.map((p) => `RP-${p.id} ${ProvisionLabels[p.type]} ${p.status}`).join("\n"),
    }));

    this.house.downloadCsv(`${this.house.currentYear()}-unsubmit-provisions.csv`, CSV_COLUMNS, rows);
  }
}
