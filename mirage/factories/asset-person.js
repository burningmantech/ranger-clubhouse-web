import { Factory } from 'miragejs';
import dayjs from 'dayjs';

/*
 * Mirrors the REST shape the API returns for asset-person: the foreign-key
 * ids (person_id, asset_id, attachment_id, check_out_person_id,
 * check_in_person_id) plus the read-only embedded objects (asset, attachment,
 * person, check_out_person, check_in_person).
 *
 * By default a row is still checked out (checked_in is null). Pass
 * `checked_in` (and a `check_in_person`) to produce a returned/history row.
 */
export default Factory.extend({
  person_id: 1,
  asset_id: 1,
  attachment_id: null,
  check_out_person_id: 1,
  check_in_person_id: null,
  checked_in: null,
  duration: 3600,

  checked_out() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  },

  asset(i) {
    return {
      id: this.asset_id ?? i + 1,
      type: 'radio',
      barcode: `B-${1000 + i}`,
      description: `Asset ${i + 1}`,
      perm_assign: false,
      year: (new Date()).getFullYear(),
    };
  },

  attachment() {
    return null;
  },

  check_out_person() {
    return { id: this.check_out_person_id ?? 1, callsign: 'Checkout Hubcap' };
  },

  check_in_person() {
    return null;
  },
});
