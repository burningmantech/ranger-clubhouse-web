import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  BANKED,
  CANCELLED,
  CLAIMED,
  DELIVERY_NONE,
  DELIVERY_POSTAL,
  DELIVERY_WILL_CALL,
  EXPIRED,
  QUALIFIED,
  SUBMITTED,
  TURNED_DOWN,
  USED,
} from 'clubhouse/models/access-document';

module('Unit | Model | access document', function (hooks) {
  setupTest(hooks);

  const buildDoc = (owner, attrs = {}) =>
    owner.lookup('service:store').createRecord('access-document', attrs);

  test('qualified status', function (assert) {
    const model = buildDoc(this.owner, { status: QUALIFIED });
    assert.true(model.isQualified);
    assert.false(model.isClaimed);
    assert.false(model.isUsing);
  });

  test('claimed status', function (assert) {
    const model = buildDoc(this.owner, { status: CLAIMED });
    assert.true(model.isClaimed);
    assert.true(model.isUsing);
    assert.false(model.isQualified);
  });

  test('banked status', function (assert) {
    const model = buildDoc(this.owner, { status: BANKED });
    assert.true(model.isBanked);
    assert.false(model.isClaimed);
    assert.false(model.isUsing);
  });

  test('submitted status', function (assert) {
    const model = buildDoc(this.owner, { status: SUBMITTED });
    assert.true(model.isSubmitted);
    assert.true(model.isUsing);
    assert.false(model.isClaimed);
  });

  test('used status', function (assert) {
    const model = buildDoc(this.owner, { status: USED });
    assert.true(model.isUsed);
    assert.false(model.isSubmitted);
    assert.false(model.isUsing);
  });

  test('cancelled status', function (assert) {
    const model = buildDoc(this.owner, { status: CANCELLED });
    assert.true(model.isCancelled);
    assert.false(model.isUsed);
    assert.false(model.isUsing);
  });

  test('expired status', function (assert) {
    const model = buildDoc(this.owner, { status: EXPIRED });
    assert.true(model.isExpired);
    assert.false(model.isCancelled);
    assert.false(model.isUsing);
  });

  test('turned down status', function (assert) {
    const model = buildDoc(this.owner, { status: TURNED_DOWN });
    assert.true(model.isTurnedDown);
    assert.false(model.isQualified);
    assert.false(model.isUsing);
  });

  test('unset status reports no status getters true', function (assert) {
    const model = buildDoc(this.owner, {});
    assert.false(model.isQualified);
    assert.false(model.isClaimed);
    assert.false(model.isBanked);
    assert.false(model.isSubmitted);
    assert.false(model.isUsed);
    assert.false(model.isCancelled);
    assert.false(model.isExpired);
    assert.false(model.isTurnedDown);
    assert.false(model.isUsing);
  });

  test('admission_date setter handles "any"', function (assert) {
    const model = buildDoc(this.owner, {});
    model.admission_date = 'any';
    assert.true(model.access_any_time);
    assert.strictEqual(model.access_date, null);
    assert.strictEqual(model.admission_date, 'any');
  });

  test('admission_date setter handles a real date', function (assert) {
    const model = buildDoc(this.owner, {});
    model.admission_date = '2026-08-25';
    assert.false(model.access_any_time);
    assert.strictEqual(model.access_date, '2026-08-25');
    assert.strictEqual(model.admission_date, '2026-08-25');
  });

  test('admission_date getter returns null when no date and not any-time', function (assert) {
    const model = buildDoc(this.owner, {});
    assert.strictEqual(model.admission_date, null);
  });

  test('expiry_year setter builds a September 15 expiry date', function (assert) {
    const model = buildDoc(this.owner, {});
    model.expiry_year = 2027;
    assert.strictEqual(model.expiry_date, '2027-09-15');
    assert.strictEqual(model.expiry_year, '2027');
  });

  test('haveAddress is true for will-call regardless of address fields', function (assert) {
    const model = buildDoc(this.owner, { delivery_method: DELIVERY_WILL_CALL });
    assert.true(model.haveAddress);
  });

  test('haveAddress is false for none delivery method', function (assert) {
    const model = buildDoc(this.owner, { delivery_method: DELIVERY_NONE });
    assert.false(model.haveAddress);
  });

  test('haveAddress is false for a postal method missing address fields', function (assert) {
    const model = buildDoc(this.owner, {
      delivery_method: DELIVERY_POSTAL,
      street1: '123 Main St',
      city: 'Reno',
      state: 'NV',
    });
    assert.false(model.haveAddress, 'missing postal_code makes haveAddress false');
  });

  test('haveAddress is true for a postal method with all address fields', function (assert) {
    const model = buildDoc(this.owner, {
      delivery_method: DELIVERY_POSTAL,
      street1: '123 Main St',
      city: 'Reno',
      state: 'NV',
      postal_code: '89501',
    });
    assert.true(model.haveAddress);
  });
});
