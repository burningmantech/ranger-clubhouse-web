import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import logError from "clubhouse/utils/log-error";

export default class MeOauth2GrantRoute extends ClubhouseRoute {
  queryParams = {
    client_id: {refreshModel: false},
    redirect_uri: {refreshModel: false},
    state: {refreshModel: false},
    oauthScope: {refreshModel: false, as: 'scope'}, // sigh, 'scope' is reserved by Emberjs.. why?!?
    response_type: {refreshMode: false},
  }

  async model({client_id, redirect_uri, state, oauthScope, response_type}) {
    try {
      return await this.ajax.request('auth/oauth2/grant-code', {
        data: {
          client_id,
          redirect_uri,
          state,
          scope: oauthScope,
          response_type
        }
      });
    } catch (response) {
      if (response.status === 422) {
        // missing parameters, and/or invalid client_id.
        logError(response, 'client-oauth-exception');
        return null;
      } else {
        throw response;
      }
    }
  }

  setupController(controller, model) {
    if (model.callback_url) {
      controller.status = 'success';
      controller.client_description = model.client_description;
      location.replace(model.callback_url);
      // goodbye!
    } else {
      controller.status = 'error';
    }
  }
}
