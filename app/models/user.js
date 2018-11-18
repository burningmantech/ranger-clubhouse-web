import EmberObject from '@ember/object';
import PersonMixin from 'clubhouse/mixins/models/person';

export default class UserModel extends EmberObject.extend(PersonMixin) {
}
