import Route from '@ember/routing/route';
import _ from 'lodash';

export default class HandleCheckerRoute extends Route {
  model() {
    return this.ajax.request('handles')
        .then((result) => _.sortBy(result.data, [(h) => h.name.toLowerCase(), 'entityType']));
  }
}
