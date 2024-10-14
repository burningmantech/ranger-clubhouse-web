import { Factory } from 'miragejs';
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

  years_combined: [2017, 2018],
  years_seen: [2017, 2018],
  years_as_ranger: [2018],
  years_as_contributor: [2020],

  callsign() {
    return faker.string.uuid();
  },

  email() {
    return faker.internet.email();
  },

  first_name() {
    return faker.person.firstName();
  },

  mi() {
    return faker.string.alpha(2)
  },

  last_name() {
    return faker.person.lastName();
  },

  street1() {
    return faker.location.streetAddress(true);
  },

  street2() {
    return faker.location.secondaryAddress()
  },

  city() {
    return faker.location.city();
  },

  state() {
    return faker.location.state({ abbreviated: true });
  },
  zip() {
    return faker.location.zipCode();
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
    return `Camp ${faker.location.city()}`;
  },
  bpguid() {
    return faker.string.uuid();
  }
});
