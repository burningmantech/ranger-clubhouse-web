import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonOnboardController extends Controller {
  @action
  noUploadAction() {
    this.modal.info('Upload Disabled', 'The upload button can only be used by the actual PNV/Auditor.');
  }
}
