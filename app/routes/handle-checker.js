import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import _ from 'lodash';

export default class HandleCheckerRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return this.ajax.request('handles')
        .then((result) => _.sortBy(result.data, [(h) => h.name.toLowerCase(), 'entityType']));
  }
}
