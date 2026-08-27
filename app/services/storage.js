import Service from '@ember/service';

const SESSION_STORAGE_KEY = 'clubhouse';
const DEVICE_STORAGE_KEY = 'clubhouse-device';

/**
 * localStorage get/set/clear.
 *
 * Preferences live in one of two namespaces, each under its own localStorage key:
 *
 * - 'clubhouse' holds preferences belonging to the logged in user, and is wiped
 *   when the session is invalidated (see session.handleInvalidate).
 * - 'clubhouse-device' holds preferences belonging to the browser itself, and
 *   survives logout.
 */

export default class StorageService extends Service {
  _getStorage(storageKey) {
    let storage;

    try {
      storage = window.localStorage.getItem(storageKey);

      if (storage) {
        storage = JSON.parse(storage);
      }
    } catch (e) {
      // browser blocking localStorage, not available, or holding garbage.
      return {};
    }

    return storage || {};
  }

  _setKey(storageKey, key, data) {
    const storage = this._getStorage(storageKey);

    if (data == null) {
      delete storage[key];
    } else {
      storage[key] = data;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(storage));
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }

  setKey(key, data) {
    this._setKey(SESSION_STORAGE_KEY, key, data);
  }

  getKey(key) {
    return this._getStorage(SESSION_STORAGE_KEY)[key];
  }

  /**
   * Device preferences are not tied to the logged in user, and so are left
   * alone by clearStorage().
   */

  setDeviceKey(key, data) {
    this._setKey(DEVICE_STORAGE_KEY, key, data);
  }

  getDeviceKey(key) {
    return this._getStorage(DEVICE_STORAGE_KEY)[key];
  }

  clearStorage() {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }
}
