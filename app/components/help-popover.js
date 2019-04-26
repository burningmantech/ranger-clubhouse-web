import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember-decorators/service';

@classNames('popover-container')
export default class HelpPopoverComponent extends Component {
  @argument('string') slug;
  @argument(optional('boolean')) bottom = false;
  @argument(optional('boolean')) left = false;
  @argument(optional('string')) label = '';

  @service ajax;

  isLoading = false;
  isShowing = false;

  body = '';

  @action
  clickHelp() {
    if (this.isShowing) {
      return;
    }

    this.set('isShowing', true);
    if (!isEmpty(this.helpText)) {
      return;
    }

    this.set('isLoading', true);
    this.ajax.request(`help/${this.slug}`).then((result) => {
      this.set('title', result.help.title);
      this.set('body', result.help.body);
    })
    .catch((response) => {
      if (response.status == 404) {
        this.set('title', 'Help not found');
        this.set('body', null);
      } else {
        this.house.handleErrorResponse(response);
      }
    })
    .finally(() => this.set('isLoading', false));
  }

  @action
  closeHelp() {
    this.set('isShowing', false);
  }
}
