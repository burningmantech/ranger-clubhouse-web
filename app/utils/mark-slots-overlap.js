/*
 * Find all slots which overlap with one another, and mark them.
 */

 import * as Position from 'clubhouse/constants/positions';

export default function markSlotsOverlap(slots) {
  let prevEndTime = 0, prevSlot = null;

  slots.forEach(function(slot) {
    if (slot.slot_begins_time < prevEndTime) {
      if (slot.isTraining && prevSlot.isTraining
      && (
          (slot.position_id == Position.TRAINING && prevSlot.position_id != Position.TRAINING)
          || (slot.position_id != Position.TRAINING && prevSlot.position_id == Position.TRAINING)
        )
      )
      {
        // Looks like dirt trainng and ART training.. which is okay.
        slot.set('is_training_overlap', true);
        prevSlot.set('is_training_overlap', true);
      } else {
        slot.set('is_overlapping', true);
        prevSlot.set('is_overlapping', true);
      }
    } else {
      slot.set('is_overlapping', false);
      slot.set('is_training_overlap', false);
    }
    prevEndTime = slot.slot_ends_time;
    prevSlot = slot;
  });
}
