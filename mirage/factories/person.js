import {Factory} from 'ember-cli-mirage';
import faker from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  status: 'active',
  apt: '',
  callsign_approved: true,
  country: 'US',
  password: 'ineedashower!',
  teeshirt_size_style: 'Mens Crew S',
  longsleeveshirt_size_style: 'Mens Regular S',
  gender: '',
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
    return faker.phone.phoneNumberFormat();
  },
  alt_phone() {
    return faker.phone.phoneNumberFormat();
  },
  create_date() {
    return dayjs().format('YYYY-MM-DD hh:mm:ss');
  },
  camp_location() {
    return faker.address.latitude() + faker.address.longitude();
  },
  bpguid() {
    return faker.datatype.uuid();
  }
});
