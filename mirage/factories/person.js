import {Factory} from 'ember-cli-mirage';
import {faker} from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  status: 'active',
  apt: '',
  callsign_approved: true,
  country: 'US',
  password: 'ineedashower!',
  tshirt_swag_id: null,
  tshirt_secondary_swag_id: null,
  long_sleeve_swag_id: null,
  gender_identity: 'female',
  gender_custom: '',
  has_reviewed_pi: false,

  callsign() {
    return faker.datatype.uuid();
  },

  email() {
    return faker.internet.email();
  },

  first_name() {
    return faker.name.firstName();
  },

  mi() {
    return faker.random.alphaNumeric(2)
  },

  last_name() {
    return faker.name.lastName();
  },

  street1() {
    return faker.address.streetAddress(true);
  },

  street2() {
    return faker.address.secondaryAddress()
  },

  city() {
    return faker.address.city();
  },

  state() {
    return faker.address.stateAbbr();
  },
  zip() {
    return faker.address.zipCode();
  },
  home_phone() {
    return faker.phone.number();
  },
  alt_phone() {
    return faker.phone.number();
  },
  created_at() {
    return dayjs().format('YYYY-MM-DD hh:mm:ss');
  },
  camp_location() {
    return `Camp ${faker.address.city()}`;
  },
  bpguid() {
    return faker.datatype.uuid();
  }
});
