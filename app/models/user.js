import EmberObject from '@ember/object';
import PersonMixin from 'clubhouse/mixins/models/person';

class UserModel extends EmberObject.extend(PersonMixin) {
  constructor(userInfo) {
    super();
    this.setProperties(userInfo);
  }
}

export default UserModel;
