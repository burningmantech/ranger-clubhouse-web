import ApplicationAdapter from './application';
import ENV from 'clubhouse/config/environment';

export default class PersonMessageAdapter extends ApplicationAdapter {
  buildURL(modelName, id) {
    const url = `${ENV['api-server']}/messages`;

    return (id ? url + `/${id}` : url);
  }
}
