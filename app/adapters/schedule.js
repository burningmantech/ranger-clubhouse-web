import ApplicationAdapter from './application';
import ENV from 'clubhouse/config/environment';

export default class ScheduleAdapter extends ApplicationAdapter {
  buildURL(modelName, id, snapshot, requestType, query) {
    let person_id;

    if (query && query.person_id) {
      person_id = query.person_id;
      delete query.person_id;
    } else if (snapshot && snapshot.adapterOptions.person_id){
      person_id = snapshot.adapterOptions.person_id
    } else {
      throw "Person is not set";
    }

    const url = `${ENV['api-server']}/person/${person_id}/schedule`;

    return (id ? url + `/${id}` : url);
  }
}
