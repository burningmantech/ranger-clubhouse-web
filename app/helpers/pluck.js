import Helper from '@ember/component/helper';

export default class Pluck extends Helper {
  compute([id, records, column, defaultValue]) {
    const record = records.find((r) => r.id == id);

    if (!record) {
      return defaultValue;
    }

    return record[column];
  }
}

