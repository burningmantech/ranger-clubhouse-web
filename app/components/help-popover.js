import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class HelpPopoverComponent extends Component {
  @service ajax;

  @tracked isLoading = false;
  @tracked isShowing = false;

  @tracked title = '';
  @tracked body = '';

  @action
  async clickHelp(event) {
    event.preventDefault();
    if (this.isShowing) {
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.ajax.request(`help/${this.args.slug}`);
      this.title = result.help.title;
      this.body = result.help.body;
    } catch (response) {
      if (+response.status === 404) {
        this.title = 'Help not found';
        this.body =  null;
      } else {
        this.errors.handleErrorResponse(response);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
