import Service, {service} from '@ember/service';
import {isArray} from '@ember/array';

/**
 * Push a raw API payload into the Ember Data store.
 *
 * Avoids common pitfalls and the weird undocumented special-sauce format that
 * must be used with the built-in pushPayload.
 */

export default class StorePayloadService extends Service {
  @service store;

  pushPayload(modelName, rawPayload) {
    if (isArray(rawPayload)) {
      return rawPayload.map((payload) => this.store.push(this.store.normalize(modelName, payload)));
    } else {
      return this.store.push(this.store.normalize(modelName, rawPayload));
    }
  }
}
