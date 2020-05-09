import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class HelpPopoverComponent extends Component {
  @service ajax;

  @tracked isLoading = false;
  @tracked isShowing = false;

  @tracked title = '';
  @tracked body = '';

  @action
  clickHelp(event) {
    event.preventDefault();
    if (this.isShowing) {
      return;
    }

    this.isShowing = true;
    this.isLoading = true;

    this.ajax.request(`help/${this.args.slug}`).then((result) => {
      this.title = result.help.title;
      this.body = result.help.body;
    })
    .catch((response) => {
      if (response.status == 404) {
        this.title = 'Help not found';
        this.body =  null;
      } else {
        this.house.handleErrorResponse(response);
      }
    })
    .finally(() => this.isLoading = false);
  }

  @action
  closeHelp(event) {
    event.preventDefault();
    this.isShowing = false;
  }
}
