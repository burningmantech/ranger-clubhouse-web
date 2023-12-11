import Component from '@glimmer/component';
import buildAddressForClipboard from "clubhouse/utils/build-address-for-clipboard";
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class PersonFullFormComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service router;
  @service toast;

  get homeAddressText() {
    return buildAddressForClipboard(this.args.person);
  }

  @action
  releaseCallsign(f) {
    const {person} = this.args;
    if (person.vintage) {
      this.modal.info('Callsign is vintage', 'The callsign has been marked as vintage and cannot be released');
      return;
    }
    this.modal.confirm('Confirm Callsign Release',
      'You are about to release/reset this callsign to the LastFYY format, and unapprove the callsign. Are you sure you want to do this?',
      async () => {
        try {
          await this.ajax.post(`person/${person.id}/release-callsign`, {});
          await person.reload();
          f.reloadForm();
          this.toast.success('The callsign was successfully released.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      })
  }
}
