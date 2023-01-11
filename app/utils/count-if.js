/**
 * Iterate the collection and count each item if the callback says so.
 *
 * @param collection
 * @param {Function} shouldCount
 * @returns Number
 */

export default function countIf(collection, shouldCount) {
  return collection.reduce((total, obj) => total + (shouldCount(obj) ? 1 : 0), 0);
}
