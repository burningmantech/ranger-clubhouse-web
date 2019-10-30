import ApplicationSerializer from 'clubhouse/serializers/application';

export default class SettingSerializer extends ApplicationSerializer {
  primaryKey = 'name';
}
