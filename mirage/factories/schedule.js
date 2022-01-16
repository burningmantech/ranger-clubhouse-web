import { Factory } from 'ember-cli-mirage';
import faker from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  credits: 0,
  has_ended: 1,
  has_started: 0,
  person_assigned: 0,
  position_id: 13,
  position_title() { return faker.random.alphaNumeric(10); },
  position_type: "Training",
  slot_active: 1,
  slot_begins() { return dayjs().add(1, 'day').format('YYYY-MM-DD hh:mm:ss');},
  slot_begins_time() { return dayjs().add(1, 'day').unix(); },
  slot_description() { return faker.random.alphaNumeric(10) },
  slot_duration: 3600,
  slot_ends() { return dayjs().add(25, 'hour').format('YYYY-MM-DD hh:mm:ss'); },
  slot_ends_time() { return dayjs().add(25, 'hour').unix() },
  slot_max: 10,
  slot_signed_up: 1,
  slot_url: "",
  trainer_count: null,
  year() { return (new Date()).getFullYear() },
});
