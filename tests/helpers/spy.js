/**
 * A minimal recording spy for asserting that component callbacks actually fire.
 *
 * Replaces the dead `() => {}` stubs and the `assert.ok(true)`-inside-a-callback
 * anti-pattern: a callback that never fires leaves `called === false`, so the
 * assertion fails loudly instead of passing vacuously.
 *
 *   const onClick = spy();
 *   await click('button');
 *   assert.true(onClick.called, 'the click handler fired');
 *   assert.deepEqual(onClick.lastArgs, [expectedArg]);
 */
export function spy() {
  const fn = (...args) => {
    fn.called = true;
    fn.callCount += 1;
    fn.calls.push(args);
    fn.lastArgs = args;
  };
  fn.called = false;
  fn.callCount = 0;
  fn.calls = [];
  fn.lastArgs = undefined;
  return fn;
}
