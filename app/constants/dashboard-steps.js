/*
    Dashboard Steps shared across all three dashboards.

    A Step consists of the following:

    - name (string): The step title or name
    - immediate (boolean): step should be placed in the 'Requires Immediate Action' group
    - skipPeriod (string): the step should be skipped for the stated period
    - period (string): the period the step should only be applied to.
    - check (function): Evaluate the step

    The object passed to the check function is:

 */

import {htmlSafe} from '@ember/template';
import {config} from 'clubhouse/utils/config';
import dayjs from 'dayjs';
import {
  ACTION_NEEDED,
  AFTER_EVENT,
  BEFORE_EVENT,
  COMPLETED,
  NOT_AVAILABLE,
  OPTIONAL,
  SKIP,
  URGENT,
  WAITING
} from "clubhouse/constants/dashboard";
import {NON_RANGER} from 'clubhouse/constants/person_status';
import TicketPackage from 'clubhouse/utils/ticket-package';

function indefiniteArticle(noun) {
  return (noun.match(/^[aeiou]/i) ? `an ${noun}` : `a ${noun}`);
}

/*
 * Step definition:
 *
 * @property {string} name - the name & title of the step, shown to the user
 * @property {boolean} [immediate] - the step is to be place into the immediate step group if true
 * @property {number} [skipPeriod] - the period (BEFORE_EVENT, EVENT, AFTER_EVENT) where the step is not relevant and always skipped.
 * @property {number} [period] - the period where only the step is relevant
 * @property {function} check({...}) - the function to determine how the step is to be shown (or not) with info.
 *
 * check() object argument definition:
 *
 * @property {PersonModel} person - the person who the dashboard is being evaluated against
 * @property {object} milestone - the person's milestone aka the object gotten from the person/NN/milestone API.
 * @property {object} [photo] - the photo status, and rejection reasons if photo was rejected
 * @property {boolean} [isPNV] - true if the person is a Prospective, Alpha, or Bonk. (PNV dashboard only)
 * @property {boolean} [isAuditor] - true if the person is an Auditor. (Auditor dashboard only)
 * @property {boolean} [prevCompleted] - true if the previous step was completed. (PNV & Auditor dashboards only)
 *
 * check() return object:
 *
 * @property {string} result - how the step is to be presented. See clubhouse/constants/dashboard.js for all results.
 * @property {boolean} [isPhotoStep] - true if the step is related to photo uploading. The Upload Photo link is to be shown.
 * @property {boolean} [isOnlineTraining] - true if the step is to include a link to the Online Course
 * @property {boolean} [isTicketing] - true if step is related to ticketing, show the claimed & banked tickets.
 * @property {boolean} [immediate] - show step in the immediate group (similar to step.immediate listed above)
 * @property {string} [message] - shown to the user. May need htmlSafe() if string contains HTML.
 * @property {boolean} [isMissingBpguid] - true if this is the Missing BPGUID step, call the <MissingBpguid> component to show instructions
 * @property {string} [route] - the step title to be shown as a link with the route property passed to <LinkTo>
 * @property {object} [linkedMessage] - show a message with a text passed to LinkTo.
 * @property {string} [email] - Add a linked (aka <a href="mailto:abc@example.com">abc@example.com</a>) email address shown after the message.
 * @property {string} [survey] - step is a survey. (). milestones.surveys has the infos.
 *
 * linkedMessage object definition:
 * @property {string} route - the ember route to pass to LinkTo
 * @property {string} message - the prefix text before the linked text.
 * @property {string} text - the linked message itself
 * @property {string} suffix - the suffix text after the linked message:
 *
 * The template looks like this:
 *    {{linkedMessage.prefix}} <LinkTo @route={{linkedMessage.route}}>{{linkedMessage.text}}</LinkTo> {{linkedMessage.suffix}}
 */


export const UPLOAD_PHOTO = {
  name: 'Upload a BMID Photo',
  immediate: true,
  check({photo, isPNV}) {
    let reasons, message;
    switch (photo.photo_status) {
      case 'rejected':
        reasons = photo.rejections.map((reason) => `<li>${reason}</li>`).join('');
        message = `Your photo was rejected for the following reason(s): <ul>${reasons}</ul>`;
        if (photo.reject_message) {
          message += `The photo reviewer left you an additional message:<br>${photo.reject_message}<br><br>`;
        }
        message += 'Please upload a new photo which conforms to the BMID requirements.';
        return {
          result: URGENT,
          isPhotoStep: true,
          message: htmlSafe(message),
          immediate: true,
        };
      case 'missing':
        if (!photo.upload_enabled) {
          return {
            result: WAITING,
            message: 'Photo uploading is not available at this time. Contact the Volunteer Coordinators for help.',
            email: 'VCEmail'
          }
        }
        return {result: ACTION_NEEDED, isPhotoStep: true};
      case 'submitted':
      case 'approved':
        return {result: isPNV ? COMPLETED : SKIP, isPhotoStep: (photo.photo_status !== 'approved')};
      default:
        return {
          result: NOT_AVAILABLE,
          message: `Sorry, the server return the status [${photo.photo_status}]. I don't know what that is. This is a bug. `
        }
    }
  }
};

export const PHOTO_APPROVAL = {
  name: 'Photo Approval',
  check({photo, isPNV}) {
    switch (photo.photo_status) {
      case 'approved':
        return {result: isPNV ? COMPLETED : SKIP};
      case 'submitted':
        return {
          result: WAITING,
          message: 'The photo is being reviewed. Usually photos are approved within 2 to 3 days.',
        };
      case 'missing':
        if (isPNV) {
          return {
            result: NOT_AVAILABLE, message: 'A photo must be uploaded.'
          }
        }
        // Photo upload step will handle a missing photo for active Rangers.
        return {result: SKIP};
      default:
        return {result: SKIP};
    }
  }
};

export const MISSING_BPGUID = {
  name: 'Link your Burner Profile',
  immediate: true,
  check({milestones}) {
    if (milestones.missing_bpguid) {
      return {
        result: URGENT,
        isMissingBpguid: true,
      };

    }
    return {result: SKIP}; // Only show the step IF a BPGUID is needed.
  }
};


export const VERIFY_TIMESHEETS = {
  name: 'Verify timesheet entries and confirm entire timesheet as final (if done working)',
  immediate: true,
  skipPeriod: BEFORE_EVENT,
  check({milestones}) {
    const {did_work, timesheets_unverified, timesheet_confirmed} = milestones;
    if (!did_work || (!timesheets_unverified && timesheet_confirmed)) {
      // Did not work or all entries are verified and user has confirmed.
      return {result: SKIP};
    }

    let message;

    if (timesheets_unverified) {
      message = `<p>${timesheets_unverified} timesheet ${timesheets_unverified === 1 ? 'entry' : 'entries'} needs to be verified.</p>`;
    } else {
      message = '';
    }

    if (milestones.period === 'after-event') {
      message += '<p class="text-danger">You will not be recorded as having worked in 2022 until you review your timesheet entries, ' +
        ' submit any corrections, and confirm your entire timesheet is correct on the Me &gt; Timesheet Corrections page.</p> ' +
        '<p><b class="text-danger">Deadline to do so is 23:59 Pacific on Saturday, October 1st.</b></p>';
    }

    return {
      result: ACTION_NEEDED,
      route: 'me.timesheet-corrections',
      linkedMessage: {
        route: 'me.timesheet-corrections',
        prefix: htmlSafe(message + ' Visit'),
        text: 'Me > Timesheet Corrections',
        suffix: 'to verify your timesheet entries, submit corrections, and confirm the entire timesheet is correct.'

      }
    };
  }
};

export const VERIFY_PERSONAL_INFO = {
  skipPeriod: AFTER_EVENT,
  name: 'Review and Update Personal Information',
  check({milestones, person, isPNV}) {
    if (milestones.has_reviewed_pi) {
      return {result: COMPLETED};
    }

    let shirtNag = '', result = ACTION_NEEDED, doTheThing = '', immediate = false;

    if (!isPNV) {
      const isNonRanger = (person.status === NON_RANGER);
      // javascript dates start from zero (meh). If it's June or later, crank up the annoyance dial.
      doTheThing = 'You have not verified your personal information and/or Ranger shirt sizes yet.';
      if (!isNonRanger && (new Date()).getMonth() >= 5) {
        immediate = true;
        result = URGENT;
        doTheThing = `<b class="text-danger">${doTheThing}</b>`;
      }
      doTheThing = `<p>${doTheThing}</p>`;
      if (!isNonRanger) {
        shirtNag = ' <b>BE SURE TO CONFIRM YOUR RANGER SHIRT SIZES ARE CORRECT.</b>';
      }
    }

    return {
      result,
      route: 'me.personal-info',
      immediate,
      linkedMessage: {
        route: 'me.personal-info',
        prefix: htmlSafe(doTheThing + 'Visit'),
        text: 'Me > Personal Info',
        suffix: htmlSafe('and click the Update button at the bottom of the page to save your changes ' +
          'or to verify that the existing information is correct.' + shirtNag),
      },
    };
  }
};

export const ONLINE_TRAINING = {
  //name: 'Read the Ranger Manual & Complete The Online Course',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, prevCompleted}) {
    let name = `Read the Ranger Manual & Complete The Online Course`;
    if (milestones.online_training_passed) {
      return {
        result: COMPLETED,
        isOnlineTraining: true,
        name
      };
    }

    if (!milestones.online_training_enabled) {
      // Don't tell them to read the ranger manual until online training is available.
      return {
        result: WAITING,
        message: `The Online Course is not quite ready yet and usually not available until late March. Watch the Ranger Announce mailing list for a message on when the course will be opened.`,
        name: `Complete The Online Course`
      }
    }

    if (isPNV && !prevCompleted) {
      return {
        result: NOT_AVAILABLE,
        message: 'You must complete the previous steps before being allowed to take the Online Course.',
        name
      };
    }

    //const duration = milestones.needs_full_online_course ? 'up to 90 minutes or more' : 'around 30 to 45 minutes';
    const duration = 'up to 90 minutes or more';

    return {
      result: ACTION_NEEDED,
      message: htmlSafe('<p>The Ranger Manual can be found at <a href="' + config('RangerManualUrl') + '" rel="noopener noreferrer" target="_blank">rangers.burningman.org</a>.</p>' +
        `<p>The Online Course will take ${duration} to complete. </p> <p>Note: it may take up to 20 minutes or more for the Clubhouse to record your course completion.</p>`),
      isOnlineTraining: true,
      name
    };
  }
};

export const SIGN_UP_FOR_TRAINING = {
  name: 'Sign up for In-Person Training',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, isAuditor}) {
    if (milestones.online_training_only) {
      return {result: SKIP};
    }

    if (milestones.training.status !== 'no-shift') {
      return {result: COMPLETED};
    }

    if (!milestones.online_training_passed) {
      let message = 'You need to complete the Online Course first before being allowed to sign up for In-Person Training.';
      if (!milestones.trainings_available) {
        message += ' Note: the In-Person Training schedule is not opened until mid to late April.'
      }
      return {
        result: NOT_AVAILABLE,
        message
      };
    }

    if (milestones.trainings_available) {
      let prefix;
      if (isPNV) {
        prefix = 'You will need to sign up and pass an In-Person Training before being allowed to sign up for your Alpha shift.';
      } else if (isAuditor) {
        prefix = ''; // nada.
      } else {
        prefix = `You will to need sign up and pass an In-Person Training before being allowed to work on playa.`;
      }
      return {
        result: ACTION_NEEDED,
        route: 'me.schedule',
        linkedMessage: {
          route: 'me.schedule',
          prefix: prefix + ' Visit',
          text: 'Me > Schedule / Sign Up',
          suffix: 'to sign up for a training session.'
        }
      };
    } else {
      return {
        result: WAITING,
        message: 'In-Person Training sign-ups are not yet available and usually do not open until mid to late April. Please check back later.'
      };
    }
  }
};

export const ATTEND_TRAINING = {
  name: 'Attend In-Person Training',
  skipPeriod: AFTER_EVENT,
  check({milestones, person, isPNV, isAuditor}) {
    if (milestones.online_training_only) {
      return {result: SKIP};
    }

    if (!milestones.online_training_passed || milestones.training.status === 'no-shift') {
      if (isPNV || isAuditor) {
        return {
          result: NOT_AVAILABLE,
          message: 'Please sign up for an In-Person Training.'
        };
      }
      return {result: SKIP};
    }

    const {training} = milestones;

    switch (training.status) {
      case 'pass':
        if (milestones.is_cheetah_cub) {
          return {
            result: COMPLETED,
            message: 'You still have to walk a Cheetah Cub shift before being allowed to work on playa.'
          }
        } else {
          if (isPNV || isAuditor) {
            return {result: COMPLETED};
          }
          return {
            result: COMPLETED,
            message: 'While you are cleared to work dirt shifts, some specialized shifts may require additional training.'
          }
        }

      case 'no-show': // trainer failed to show up
        return {
          result: URGENT,
          message: `You did not attend as a trainer to teach the training on ${dayjs(training.date).format('dddd, MMMM Do YYYY')} located at ${training.location}. You must either attend and pass training as a trainee OR teach a session in order to work on playa.`,
          immediate: true
        };

      case 'fail':
        return {
          result: URGENT,
          message: `You did not attend or failed to complete training on ${dayjs(training.date).format('dddd, MMMM Do YYYY')} located at ${training.location}. Email the Training Academy to sign up for another session.`,
          email: 'TrainingAcademyEmail',
          immediate: true
        };

      case 'pending': {
        let prefix, dt;
        if (training.is_trainer) {
          prefix = 'You are signed up to teach an In-Person Training session. Once you have been marked as having taught the session, you will be considered "trained" and able to work on playa.';
          dt = 'ddd MMM DD [@] HH:mm';
        } else if (milestones.needs_full_training || isAuditor || isPNV) {
          if (isAuditor) {
            prefix = "Attend the FULL DAY training";
          } else {
            prefix = 'Because you are ';
            if (milestones.is_binary) {
              prefix += 'a binary Ranger'
            } else if (isPNV) {
              prefix += 'a prospective Ranger'
            } else {
              prefix += ` ${indefiniteArticle(person.status)} Ranger`;
            }
            prefix += ", you'll need to attend the <b>FULL DAY training</b>";
          }
          dt = 'ddd MMM DD [@] HH:mm';
        } else {
          prefix = "You'll only need to attend the half day training portion";
          dt = 'ddd MMM DD';
        }
        prefix += `:<div class="my-2">${dayjs(training.date).format(dt)}  - ${training.location}.</div>Visit`;
        return {
          result: ACTION_NEEDED,
          linkedMessage: {
            route: 'me.schedule',
            prefix: htmlSafe(prefix),
            text: 'Me > Schedule / Sign Up',
            suffix: 'to remove your sign-up from the schedule if you cannot make it.'
          }
        };
      }
    }
  }
};

export const TAKE_STUDENT_SURVEY = {
  name: 'Take a Training Survey (optional)',
  skipPeriod: AFTER_EVENT,
  check({milestones}) {
    if (milestones.surveys.sessions.length > 0) {
      return {
        result: OPTIONAL,
        message: 'Please take a moment to provide feedback on your In-Person Training experience:',
        survey: 'student'
      };

    }
    return {result: SKIP}; // Only show the step IF a survey is available (marked as passed training, and a survey has been created)
  }
};

export const SIGN_UP_FOR_SHIFTS = {
  name: 'Sign up for shifts',
  skipPeriod: AFTER_EVENT,

  check({milestones, isPNV, isAuditor, person}) {
    const isNonRanger = (person.status === NON_RANGER);
    if (!milestones.online_training_passed && (isAuditor || isPNV)) {
      return {
        result: NOT_AVAILABLE,
        message: `You need to complete the Online Course first before being allowed to sign up shifts.`
      };
    }

    if (!milestones.dirt_shifts_available && !isNonRanger) {
      return {
        result: NOT_AVAILABLE,
        message: 'The full Ranger schedule is posted by the first or second week in July. Watch the Announce mailing list for a message on when the schedule will open.',
      };
    }

    const {shift_signups} = milestones;

    if (shift_signups.slot_count) {
      /*
        const totalHours = shift_signups.total_duration ? (+shift_signups.total_duration / 3600.0).toFixed(2) : '0.00';
        const countedHours = shift_signups.counted_duration ? (+shift_signups.counted_duration / 3600.0).toFixed(2) : '0.00';
        let notedHours = '';
        if (shift_signups.total_duration !== shift_signups.counted_duration) {
         notedHours = ` (${totalHours} total hours)`
        }
      */
      return {
        result: COMPLETED,
        sticky: true, // keep sorted close to the top
        route: 'me.schedule',
        linkedMessage: {
          route: 'me.schedule',
          prefix:
            `You are signed up for ${shift_signups.slot_count} working shift${shift_signups.slot_count === 1 ? '' : 's'}` +
            ` potentially earning ${shift_signups.credits.toFixed(2)} credits. Thank you! Visit`,
          text: 'Me > Schedule / Sign Up',
          suffix: `to adjust your schedule.`
        }
      };

    }

    return {
      result: ACTION_NEEDED,
      route: 'me.schedule',
      linkedMessage: {
        route: 'me.schedule',
        prefix: 'Shift sign-ups are available. Visit',
        text: 'Me > Schedule / Sign Up',
        suffix: 'to sign up.'
      }
    };
  }
};

export const SIGN_BEHAVIORAL_AGREEMENT = {
  name: 'Sign the Burning Man Behavioral Standards Agreement (optional)',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV}) {
    if (milestones.behavioral_agreement) {
      return {result: isPNV ? COMPLETED : SKIP};
    }

    return {
      result: OPTIONAL,
      message: 'Optionally, sign the Behavioral Standards Agreement.',
      route: 'me.agreements.index',
      linkedMessage: {
        route: 'me.agreements.index',
        prefix: 'Visit',
        text: 'Me > Agreements',
        suffix: 'to review and agree to the standards agreement.'
      },
    };
  }
};

export const SIGN_MOTORPOOL_AGREEMENT = {
  name: 'Sign the Ranger Motorpool Policy (optional)',
  skipPeriod: AFTER_EVENT,
  check({milestones}) {
    if (!milestones.motorpool_agreement_available) {
      return {result: SKIP};
    }

    if (milestones.motorpool_agreement_signed) {
      return {result: COMPLETED};
    }
    return {
      result: OPTIONAL,
      route: 'me.agreements.index',
      linkedMessage: {
        route: 'me.agreements.index',
        prefix: 'Ranger vehicles are a limited resource and issued based on availability. Vehicles are assigned according to operational need rather than convenience. Visit',
        text: 'Me > Agreements',
        suffix: 'to review and agree to the Ranger Motor-Pool Policy, which is required to drive a golf cart or UTV ("gator")'
      },
    };
  }
};

export const VERIFY_TIMESHEETS_FINISHED = {
  name: 'Verify timesheet entries and confirm entire timesheet as correct',
  skipPeriod: BEFORE_EVENT,
  check({milestones}) {
    const {did_work, timesheets_unverified, timesheet_confirmed} = milestones;
    if (!did_work || timesheets_unverified || !timesheet_confirmed) {
      // Did not work or still have unverified entries.
      return {result: SKIP};
    }

    return {
      result: COMPLETED,
      message: 'Thank you for your volunteering efforts!',
    }
  }
};

export const SIGN_RADIO_CHECKOUT_AGREEMENT = {
  name: 'Sign the Ranger Radio Checkout Agreement',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, person}) {
    if (milestones.asset_authorized) {
      return {result: COMPLETED};
    }

    if (isPNV) {
      return {
        result: NOT_AVAILABLE,
        message: 'You need to pass In-Person Training first before you may sign the Radio Checkout Agreement.'
      };
    }

    if (!milestones.radio_checkout_agreement_enabled) {
      if (isPNV) {
        return {
          result: NOT_AVAILABLE,
          message: 'The Radio Checkout Agreement is not available to sign at the moment. Please check back later.'
        };
      }
      return {result: SKIP};
    }


    let adj;
    if (person.isNonRanger) {
      adj = 'Ranger volunteers';
    } else if (isPNV) {
      adj = 'Prospective Rangers'
    } else {
      adj = 'Rangers';
    }

    return {
      result: ACTION_NEEDED,
      route: 'me.agreements.index',
      linkedMessage: {
        route: 'me.agreements.index',
        prefix: htmlSafe(`All ${adj} must sign the Ranger Radio Checkout Agreement prior to checking out a radio from the Rangers.<br><br>Visit`),
        text: 'Me > Radio Agreement',
        suffix: 'to review and agree to the Radio Checkout Agreement.'
      },
    };
  }
};

function usingTicket(t) {
  return (t && (t.isClaimed || t.isSubmitted));
}


function buildTickets(milestones, personId, house) {
  const claimed = [];

  const pkg = new TicketPackage(milestones.ticketing_package, personId, house);

  let ticket = null;
  pkg.tickets.forEach((t) => {
    if (t.isClaimed || t.isSubmitted) {
      claimed.push(t);
      ticket = t;
    }
  });

  if (usingTicket(pkg.vehiclePass)) {
    claimed.push(pkg.vehiclePass);
  }

  if (usingTicket(pkg.wap)) {
    claimed.push(pkg.wap);
  }

  const provisions = { claimed: [ ], banked: [ ]};

  if (pkg.jobItems) {
    // jobItems is set when there are allocated provisions. This is the union between the earned & allocated provisions.
    pkg.jobItems.forEach((item) => provisions.claimed.push(item));
  } else if (ticket) {
    pkg.provisions.filter((p) => !p.isBanked).forEach((p) => provisions.claimed.push(p));
  }

  pkg.wapso.forEach((so) => claimed.push(so));

  return {
    claimed,
    bankedCount: pkg.accessDocuments.filter((ad) => ad.isBanked).length,
    qualifiedCount: pkg.tickets.filter((a) => a.isQualified).length,
    notCriticalCount: pkg.accessDocuments.filter((ad) => ( ad.isQualified && (ad.isWAP || ad.isVehiclePass))).length,
    // noAddress: !pkg.haveAddress,
    noAddress: false,
    provisions
  };
}

export const TICKETING_OPEN = {
  name: 'Claim Tickets, Vehicle Passes, and Work Access Passes',
  skipPeriod: AFTER_EVENT,
  check({milestones, person, house}) {
    const period = milestones.ticketing_period;

    if (period !== 'open' || !milestones.ticketing_package) {
      return {result: SKIP};
    }

    const tickets = buildTickets(milestones, person.id, house);

    if (tickets.qualifiedCount) {
      return {
        result: ACTION_NEEDED,
        route: 'me.tickets',
        immediate: (tickets.qualifiedCount || tickets.noAddress),
        isTicketing: true,
        ticketingOpen: true,
        tickets
      };
    }

    // stuff has been claimed..
    return {
      result: COMPLETED,
      route: 'me.tickets',
      isTicketing: true,
      ticketingOpen: true,
      tickets,
      immediate: false, // move it down
    };
  }
};

export const TICKETING_CLOSED = {
  name: 'Ticketing has closed',
  period: BEFORE_EVENT,
  check({milestones, house, person}) {
    if (milestones.ticketing_period !== 'closed' || !milestones.ticketing_package) {
      return {result: SKIP};
    }

    return {
      result: NOT_AVAILABLE,
      isTicketing: true,
      isTicketingClosed: true,
      tickets: buildTickets(milestones, person.id, house),
    };
  }
};

export const VEHICLE_REQUESTS = {
  name: 'Submit Personal Vehicle Request(s)',
  skipPeriod: AFTER_EVENT,
  check({milestones}) {
    if (!milestones.vehicle_requests_allowed) {
      return {result: SKIP};
    }

    const vr = milestones.vehicle_requests;
    if (vr.find((r) => r.status === 'approved')) {
      return {
        result: COMPLETED,
        linkedMessage: {
          route: 'me.vehicles',
          prefix: 'Your vehicle request has been approved. Visit',
          text: 'Me > Vehicle Requests',
          suffix: 'for details.'
        }
      };
    } else if (vr.find((r) => r.status === 'pending')) {
      return {
        result: WAITING,
        linkedMessage: {
          route: 'me.vehicles',
          prefix: 'Your vehicle request is pending review. Visit',
          text: 'Me > Vehicle Requests',
          suffix: 'to adjust or delete your request.'
        }
      };

    } else if (vr.find((r) => r.status === 'rejected')) {
      return {
        result: URGENT,
        linkedMessage: {
          route: 'me.vehicles',
          prefix: 'Your vehicle request has been denied. Visit',
          text: 'Me > Vehicle Requests',
          suffix: 'for details.'
        }
      };
    } else {
      return {
        result: ACTION_NEEDED,
        linkedMessage: {
          route: 'me.vehicles',
          prefix: 'You have been approved to submit vehicle requests and reauthorizations for driving stickers and other items. Visit',
          text: 'Me > Vehicle Requests',
          suffix: 'to submit a request.'
        }
      };
    }
  }
};

// Step is required in all dashboard periods.
export const SIGN_NDA = {
  name: 'Sign the Sensitive Data Access and Use Policy Agreement',
  immediate: true,
  check({milestones}) {
    if (!milestones.nda_required) {
      // Don't worry about it if not required or already signed.
      return {result: SKIP};
    }

    return {
      result: URGENT,
      route: 'me.agreements.index',
      linkedMessage: {
        route: 'me.agreements.index',
        prefix: htmlSafe('Starting late 2022, all Clubhouse users who have been granted either the Login Management Year Round or On Playa roles are required EACH CALENDAR YEAR to review and agree to the Sensitive Data Access and Use Policy document. <b class="text-danger">Your privileges are suspended until the document is agreed to.</b><br><br> Visit'),
        text: 'Me > Agreements',
        suffix: 'to review and agree to the document.'
      },
    };
  }
};
