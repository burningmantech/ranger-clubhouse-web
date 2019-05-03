import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { action } from '@ember/object';
import $ from 'jquery';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import _ from 'lodash';

export default class HandleCheckerRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return this.ajax.request('handles')
        .then((result) => _.sortBy(result.data, [(h) => h.name.toLowerCase(), 'entityType']));
  }

  @action
  didTransition() {
    // autofocus hack - controllers do not have a didInsertElement() sadly.
    run.schedule('afterRender', () => { $('#currentName').focus(); });
  }
}
