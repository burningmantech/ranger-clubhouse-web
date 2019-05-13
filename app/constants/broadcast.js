
// Broadcast types - should mirror api/app/Models/Broadcast.php

export const Type = {
  GENERAL: 'general',    // General non-emergency announcement, like the allcom mailing list.
  SLOT_EDIT: 'slot-edit',  // Slot time change or deletion cancellation (comes from Edit Slots page)
  POSITION: 'position',   // People who hold a position
  SLOT: 'slot',       // People who are signed up for a shift
  ONSHIFT: 'onshift',    // Send to people on shift (radio repeater down, city split happening)
  RECRUIT_DIRT: 'recruit-dirt', // Request for more people for a shift, dirt
  RECRUIT_POSITION: 'recruit-position', // Request for more people based on position
  EMERGENCY: 'emergency' // All hands on deck - limited to playa.
};


// Alert Types - should mirror api/app/Models/Alert.php
export const Alert = {
  SHIFT_CHANGE: 1,
  SHIFT_MUSTER: 2,
  EMEREGENCY_BROADCAST: 3,
  RANGER_SOCIALS: 4,
  TICKETING: 5,
  ON_SHIFT: 6,
  TRAINING: 7,
  CLUBHOUSE_NOTIFY_ON_PLAYA: 8,
  CLUBHOUSE_NOTIFY_PRE_EVENT: 9,
  SHIFT_CHANGE_PRE_EVENT: 10,
  SHIFT_MUSTER_PRE_EVENT: 11,

  // The following are not part of the RBS and are email only
  RANGER_CONTACT: 12,
  MENTOR_CONTACT: 13,
};

/*
 * The Broadcasts table describes each broadcast type works and how the
 * form should be built.
 *
 * title (string): Page title header
 * alert (when integer): the Alert Preference type used for a simple form
 * alert (when array): Only allow a limited Alert Preferences to be selected
 * subject (string): Email/Clubhouse subject to use
 * message (string): Default message
 */

export const Broadcasts = {
    [Type.GENERAL]: {
        title: 'General Population Broadcast',
    },

    [Type.POSITION]: {
        title: 'Team Broadcast',
    },

    [Type.SLOT]: {
        title: 'Shift Sign-Ups Broadcast',
        subject: '[Rangers] Information concerning a shift you are signed up for',
    },

    /*
     * Start of Simple Broadcasts
     *
     * These will only accept a SMS sized message. The email subject is set
     * the message. No Clubhouse message created.
     */

     [Type.ONSHIFT]: {
         title: 'Rangers On Shift Broadcast',
     },

     [Type.RECRUIT_DIRT]: {
         title: 'Request willing off-duty Dirt Rangers to report for duty',
         message: 'Dirt shift is understaffed. More Rangers needed NOW. Report to HQ if you are available and want to help.',
     },

    [Type.RECRUIT_POSITION]: {
        title: 'Request willing off-duty Special Team Rangers to report for duty',
    },

    [Type.EMERGENCY]: {
        title: 'Emergency Broadcast To Rangers',
        message: 'EMERGENCY! ALL RANGERS NEEDED NOW! REPORT TO HQ, BERLIN, OR TOKYO OUTPOSTS.'
    }
};
