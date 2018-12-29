/*
 * Find all slots which overlap with one another, and mark them.
 */
 
export default function markSlotsOverlap(slots) {
  let prevEndTime = 0, prevSlot = null;

  slots.forEach(function(slot) {
    if (slot.slot_begins_time < prevEndTime) {
      slot.set('is_overlapping', true);
      prevSlot.set('is_overlapping', true);
    } else {
      slot.set('is_overlapping', false);
    }
    prevEndTime = slot.slot_ends_time;
    prevSlot = slot;
  });
}
