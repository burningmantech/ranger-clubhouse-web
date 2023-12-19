import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class PersonTokensComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked isLoading = true;
  @tracked isSubmitting = false;

  @tracked tokens;

  constructor() {
    super(...arguments);
    this._loadTokens();
  }

  async _loadTokens() {
    this.isLoading = true;
    try {
      this.tokens = (await this.ajax.request(`person/${this.args.person.id}/tokens`)).tokens;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  revokeToken(token) {
    this.modal.confirm('Confirm Token Revocation',
      `Tokens will automatically expire after a certain period. By revoking a token, you may cause the person to be logged out. Are you absolutely sure you want to revoke token #${token.id}? `,
      async () => {
        this.isSubmitting = true;
        try {
          await this.ajax.delete(`person/${this.args.person.id}/revoke-token`, {data: {id: token.id}});
          this.tokens = this.tokens.filter((t) => t.id !== token.id);
          this.toast.success('Token successfully revoked.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}
