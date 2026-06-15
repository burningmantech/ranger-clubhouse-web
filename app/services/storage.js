import Service from '@ember/service';

/**
 * localStorage get/set/clear, namespaced under the 'clubhouse' key.
 */

export default class StorageService extends Service {
  _getStorage() {
    let storage;

    try {
      storage = window.localStorage.getItem('clubhouse');

      if (storage) {
        storage = JSON.parse(storage);
      }
    } catch (e) {
      // browser blocking localStorage or not available.
      return {};
    }

    return storage || {};
  }

  setKey(key, data) {
    const storage = this._getStorage();

    if (data == null) {
      delete storage[key];
    } else {
      storage[key] = data;
    }

    try {
      window.localStorage.setItem('clubhouse', JSON.stringify(storage));
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }

  getKey(key) {
    return this._getStorage()[key];
  }

  clearStorage() {
    try {
      window.localStorage.removeItem('clubhouse');
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }
}
