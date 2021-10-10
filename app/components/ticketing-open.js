import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {later} from '@ember/runloop';
import {inject as service} from '@ember/service';

export default class TicketingOpenComponent extends Component {
  @tracked showing = {};
  @tracked isPNV = false;
  @tracked isSavingDocumentStatus = false;

  @service ajax;
  @service house;
  @service store;
  @service toast;

  constructor() {
    super(...arguments);
    const {person} = this.args;

    if (person.isAlpha || person.isProspective) {
      // Person is a PNV. Only the WAP section will be shown.
      this.isPNV = true;
    }
  }

  /**
   * Find the ticket being used.
   * @returns {null|AccessDocumentModel}
   */

  get ticket() {
    return this.args.ticketPackage.ticket;
  }

  /**
   * Common routine to set the Access Document status based on the user's choice.
   * (i.e., bank, claim, release/qualify)
   *
   * @param {AccessDocumentModel} document
   * @param {string} status
   */

  @action
  setDocumentStatus(document, status) {
    this.toast.clear();
    this.isSavingDocumentStatus = true;
    this.ajax.request(`access-document/statuses`, {
      method: 'PATCH',
      data: {statuses: [{id: document.id, status}]}
    }).then((result) => {
      this.house.pushPayload('access-document', result.access_document);
      this.toast.success('Your choice has been successfully saved.');
      const {vehiclePass} = this.args.ticketPackage;
      if (vehiclePass && document.isTicket) {
        // Vehicle Pass may have been released because all tickets were banked.
        return vehiclePass.reload();
      }
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSavingDocumentStatus = false);
  }

  /**
   * The Next Button!
   *
   * Close up any opened ticketing section, and then open up the specified one.
   *
   * @param {string} section
   */

  @action
  nextSection(section) {
    this._showHideSection(section, true);
    later(() => this.house.scrollToElement(`#ticket-${section}`), 500);
  }

  /**
   * Toggle the section open or close.
   *
   * @param {string} section
   */

  @action
  toggleCard(section) {
    this._showHideSection(section, !this.showing[section]);
  }

  /**
   * Open or close the given section, and close up any other sections
   * currently opened.
   *
   * @param {string} section
   * @param {boolean} reveal
   * @private
   */

  _showHideSection(section, reveal) {
    const opened = this.showing;
    Object.keys(opened).forEach((id) => {
      if (opened[id]) {
        this.house.collapse(`#ticket-${id} .card-body`, 'hide');
      }
    });

    this.showing = {[section]: reveal};
    this.house.collapse(`#ticket-${section} .card-body`, reveal ? 'show' : 'hide');
  }
}
