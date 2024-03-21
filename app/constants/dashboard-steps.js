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
import {setting} from 'clubhouse/utils/setting';
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
import {ACTIVE, AUDITOR, INACTIVE, INACTIVE_EXTENSION, NON_RANGER, RETIRED} from 'clubhouse/constants/person_status';
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
  check({photo, isPNV, milestones}) {
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
          let message;
          if (milestones.period === BEFORE_EVENT) {
            message = 'Photo uploading has been disabled in preparation to have the BMIDs printed.'
          } else {
            message = 'Photo uploading is disabled until early November so the Photo Wranglers have time to recover.'
          }

          return {
            result: WAITING,
            message: `${message} Contact the Volunteer Coordinators for help.`,
            email: 'VcEmail'
          }
        }
        return {
          result: ACTION_NEEDED,
          isPhotoStep: true
        };
      case 'submitted':
      case 'approved':
        return {
          result: isPNV ? COMPLETED : SKIP,
          isPhotoStep: (photo.photo_status !== 'approved'),
          isUploadPhoto: true
        };
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
      message += '<p class="text-danger">You will not be recorded as having worked this event until you review your timesheet entries, ' +
        ' submit any corrections, and confirm your entire timesheet is correct on the Me &gt; Timesheet Corrections page.</p> ' +
        '<p><b class="text-danger">Deadline to do so is 23:59 Pacific on October 1st.</b></p>';
    }

    return {
      result: ACTION_NEEDED,
      route: 'me.timesheet',
      linkedMessage: {
        route: 'me.timesheet',
        prefix: htmlSafe(message + ' Visit'),
        text: 'Me > Timesheets',
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
      doTheThing = 'Each year, every volunteer is asked to review and verify their personal information in the Clubhouse.';
      if (!isNonRanger && milestones.online_course_passed) {
        // C'mon, you haven't done this step yet?!? Sheese.
        immediate = true;
        result = URGENT;
        doTheThing = `<b class="text-danger">${doTheThing}</b>`;
      }
      doTheThing = `<p>${doTheThing}</p>`;
      if (!isNonRanger && person.status !== AUDITOR) {
        shirtNag = ' <b>Be sure to confirm your Ranger shirt sizes are up to date.</b>';
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

export const ONLINE_COURSE = {
  //name: 'Read the Ranger Manual & Complete The Online Course',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, prevCompleted, person}) {
    let name = `Read the Ranger Manual & Complete The Online Course`;
    if (milestones.online_course_passed) {
      return {
        result: COMPLETED,
        isOnlineTraining: true,
        name
      };
    }

    if (!milestones.online_course_enabled) {
      // Don't tell them to read the ranger manual until online training is available.
      return {
        result: WAITING,
        message: 'The Online Course is still being prepared and is usually available in late March or early April. Watch the Ranger Announce mailing list for a message on when the course will be opened.',
        name: 'Complete The Online Course'
      }
    }

    if (isPNV && !prevCompleted) {
      return {
        result: NOT_AVAILABLE,
        message: 'You must complete the steps in the previous section, including awaiting on any photo approvals, before being allowed to take the Online Course.',
        name
      };
    }

    //const duration = milestones.needs_full_online_course ? 'up to 90 minutes or more' : 'around 30 to 45 minutes';
    const duration = 'up to 2 hours or more';

    let message;
    const isNonRanger = person.status === NON_RANGER;
    const manualLocation = '<p>The Ranger Manual can be found at <a href="' + setting('RangerManualUrl') + '" rel="noopener noreferrer" target="_blank">rangers.burningman.org</a>.</p>';

    if (isNonRanger) {
      message =
        '<p>As a Non Ranger Volunteer, you have the option to take the Ranger Online Course. If you do decide to attend an In-Person training, the Online Course must be completed first.</p>' +
        manualLocation +
        '<p>Please be sure to focus on the radio protocol section of the manual in case you will be carrying a radio.</p>' +
        `<p>Note: it may take up to 20 minutes for the Clubhouse to record your course completion.</p>`;

    } else {
      message = manualLocation +
        `<p>The Online Course, like the In-Person training, has to be completed every year. The estimate time to complete the course is ${duration}.</p> <p>Note: it may take up to 20 minutes, or more, for the Clubhouse to record your course completion.</p>`;
    }
    return {
      result: isNonRanger ? OPTIONAL : ACTION_NEEDED,
      message: htmlSafe(message),
      isOnlineTraining: true,
      name
    };
  }
};

export const SIGN_UP_FOR_TRAINING = {
  name: 'Sign up for In-Person Training',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, isAuditor}) {
    if (milestones.online_course_only) {
      return {result: SKIP};
    }

    if (milestones.training.status !== 'no-shift') {
      return {result: COMPLETED};
    }

    if (!milestones.online_course_passed) {
      let message = 'You must complete the Online Course before attending an In-Person Training.';
      if (!milestones.trainings_available) {
        message += ' The In-Person Training schedule will be available in mid-to-late April.'
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
        prefix = 'An In-Person training must be attended each year. You will to need sign up for and pass an In-Person Training before being allowed to work on playa.';
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
        message: 'The schedule for the In-Person Trainings is still being prepared, but it is usually available by mid-to-late April.',
      };
    }
  }
};

export const ATTEND_TRAINING = {
  name: 'Attend In-Person Training',
  skipPeriod: AFTER_EVENT,
  check({milestones, person, isPNV, isAuditor}) {
    if (milestones.online_course_only) {
      return {result: SKIP};
    }

    if (!milestones.online_course_passed || milestones.training.status === 'no-shift') {
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
            message: 'You still have to attend a Cheetah Cub shift before being allowed to work on playa.',
          }
        } else {
          if (isPNV || isAuditor) {
            return {result: COMPLETED};
          }
          return {
            result: COMPLETED,
            message: 'While you are cleared to work dirt shifts, some specialized shifts may require Advanced Ranger Training (ART).'
          }
        }

      case 'no-show': // trainer failed to show up
        return {
          result: URGENT,
          message: `You were scheduled to teach on ${dayjs(training.date).format('dddd, MMMM Do YYYY')}, but did not attend. You must either attend and pass training as a trainee OR teach a session in order to work on playa.`,
          immediate: true
        };

      case 'fail':
        return {
          result: URGENT,
          message: `It appears that you were absent or did not complete training on ${dayjs(training.date).format('dddd, MMMM Do YYYY')} located at ${training.location}. You must complete an In-Person before being allowed to walk an Alpha shift, and potentially become a Ranger. You are not allowed to sign up for another session through the Clubhouse at this point. Email the Training Academy, explain your absence, and request another sign-up.`,
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
            prefix = '<b class="text-danger"><u>Attend the FULL DAY training</u></b>';
          } else {
            prefix = 'Because you are ';
            if (milestones.is_binary) {
              prefix += 'a Ranger with less than two events experience'
            } else if (isPNV) {
              prefix += 'a prospective Ranger'
            } else {
              prefix += `${indefiniteArticle(person.status)} Ranger`;
            }
            prefix += ', you need to attend the <b class="text-danger"><u>FULL DAY training</u></b>';
          }
          dt = 'ddd MMM DD [@] HH:mm';
        } else {
          if (person.status === ACTIVE) {
            prefix = "Because you are a Ranger with two or more event experience, you only need to attend the half day portion";
          } else {
            prefix = "You only need to attend the half day training portion";
          }
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

export const TAKE_ALPHA_SURVEY = {
  name: 'Take A Mentor Survey (optional)',
  skipPeriod: AFTER_EVENT,
  check({milestones}) {
    if (milestones.surveys.alpha_survey) {
      return {
        result: OPTIONAL,
        message: 'Congratulations on passing your Alpha shift. Welcome to the Ranger family! Please take a moment to provide feedback on your experience with the Alpha shift and your Mentors:',
        survey: 'alpha'
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
    if (!milestones.online_course_passed && (isAuditor || isPNV)) {
      return {
        result: NOT_AVAILABLE,
        message: `You need to complete the Online Course first before being allowed to sign up shifts.`
      };
    }

    if (!milestones.dirt_shifts_available && !isNonRanger) {
      return {
        result: NOT_AVAILABLE,
        message: 'The full Ranger schedule will be posted in mid-to-late June. Check the Announce mailing list for updates on when the schedule will be available.',
      };
    }

    const {shift_signups} = milestones;

    if (shift_signups.slot_count) {
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
      route: 'me.agreements',
      linkedMessage: {
        route: 'me.agreements',
        prefix: 'Visit',
        text: 'Me > Agreements',
        suffix: 'to review and agree to the standards agreement.'
      },
    };
  }
};

export const SIGN_MOTORPOOL_AGREEMENT = {
  name: 'Sign the Ranger Motorpool Policy',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV}) {
    const {mvr_eligible} = milestones;
    const name = `Sign the Ranger Motorpool Policy ${mvr_eligible ? '' : '(optional)'}`;

    if (!milestones.motorpool_agreement_available) {
      return {result: SKIP};
    }

    if (milestones.motorpool_agreement_signed) {
      return {name, result: COMPLETED};
    }

    if (isPNV && milestones.training.status !== 'pass') {
      return {
        result: NOT_AVAILABLE,
        message: 'You need to pass In-Person Training first before you may sign the Motorpool Agreement Policy.'
      };
    }

    let prefix = '';
    let suffix = 'to review and agree to the Ranger Motor-Pool Policy, which is required to drive a golf cart or UTV ("gator").';

    if (isPNV) {
      prefix = 'While most shifts do not involve the use of a Ranger vehicle, sometimes Khaki may ask a Ranger pair to drive a golf cart or UTV for a mission. You will not be using a vehicle during your Alpha shift.';
    } else if (mvr_eligible || milestones.mvr_potential) {
      prefix = 'Ranger vehicles are a limited resource and issued based on availability. Vehicles are assigned according to operational need rather than convenience. Visit';
      suffix = htmlSafe(`${suffix}<div class="mt-2">Signing the Motor Pool Policy is optional, however by not signing you will not be eligible to drive ANY vehicle on behalf of the Rangers.</div>`);
    }

    return {
      name,
      result: mvr_eligible ? ACTION_NEEDED : OPTIONAL,
      linkedMessage: {
        route: mvr_eligible ? 'me.vehicles' : 'me.agreements',
        prefix,
        text: mvr_eligible ? 'Me > Vehicle Dashboard' : 'Me > Agreements',
        suffix
      },
    };
  }
};

export const MVR_REQUEST = {
  name: 'Submit a MVR request',
  period: BEFORE_EVENT,
  check({milestones}) {
    const {mvr_eligible} = milestones;

    if (!milestones.motorpool_agreement_available || (!mvr_eligible && !milestones.mvr_potential)) {
      return {result: SKIP};
    }

    if (milestones.org_vehicle_insurance) {
      return {
        result: COMPLETED,
        message: 'Your MVR request has been approved.'
      }
    }

    if (milestones.ignore_mvr) {
      return {
        name: 'Submit a MVR request (muted)',
        result: COMPLETED,
        message: 'You have chosen to mute the MVR request.',
      }
    }

    return {
      result: ACTION_NEEDED,
      ignoreMVR: true,
      linkedMessage: {
        route: 'me.vehicles',
        prefix: 'You are eligible to submit a MVR request. Visit',
        text: 'Me > Vehicle Dashboard',
        suffix: 'for instructions on how to submit one, or to mute this step.'
      }
    }
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

    if (isPNV && milestones.training.status !== 'pass') {
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


    let adj, alpha = '';
    if (person.isNonRanger) {
      adj = 'Ranger volunteers';
    } else if (isPNV) {
      adj = 'Prospective Rangers'
      alpha = ' You will be using a radio during your Alpha shift.';
    } else {
      adj = 'Rangers';
    }

    const isAugust = (new Date).getMonth() === 7;
    return {
      // In August, bump up to urgent.
      result: isAugust ? URGENT : ACTION_NEEDED,
      immediate: isAugust,
      route: 'me.agreements',
      linkedMessage: {
        route: 'me.agreements',
        prefix: htmlSafe(`All ${adj} must sign the Ranger Radio Checkout Agreement prior to checking out a radio from the Rangers.${alpha}<br><br>Visit`),
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

  pkg.tickets.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push(t);
    }
  });

  if (usingTicket(pkg.vehiclePass)) {
    claimed.push(pkg.vehiclePass);
  }

  if (usingTicket(pkg.wap)) {
    claimed.push(pkg.wap);
  }

  pkg.wapso.forEach((so) => claimed.push(so));

  pkg.giftTickets.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push(t);
    }
  });

  pkg.giftVPs.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push(t);
    }
  });

  pkg.lsdTickets.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push(t);
    }
  });

  pkg.lsdVPs.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push(t);
    }
  })


  return {
    claimed,
    bankedCount: pkg.accessDocuments.filter((ad) => ad.isBanked).length,
    qualifiedCount: pkg.tickets.filter((a) => a.isQualified).length,
    notCriticalCount: pkg.accessDocuments.filter((ad) => (ad.isQualified && (ad.isWAP || ad.isVehiclePass))).length,
    // noAddress: !pkg.haveAddress,
    noAddress: false,
    provisionItems: !pkg.provisionsBanked ? pkg.provisionItems : null,
    notFinished: pkg.started_at && !pkg.finished_at,
  };
}

export const TICKETING_OPEN = {
  name: 'Claim Tickets, Vehicle Passes, and Setup Access Passes',
  skipPeriod: AFTER_EVENT,
  check({milestones, person, house}) {
    const period = milestones.ticketing_period;

    if (period !== 'open' || !milestones.ticketing_package) {
      return {result: SKIP};
    }

    const tickets = buildTickets(milestones, person.id, house);

    if (tickets.qualifiedCount || tickets.noAddress || tickets.notFinished) {
      return {
        result: ACTION_NEEDED,
        route: 'me.tickets',
        immediate: true,
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
  name: 'Personal Vehicle Request Eligible',
  skipPeriod: AFTER_EVENT,
  check({milestones}) {
    if (!milestones.motorpool_agreement_available) {
      return {result: SKIP};
    }

    if (!milestones.pvr_eligible && !milestones.pvr_potential) {
      return {result: SKIP};
    }

    const vr = milestones.vehicle_requests;
    if (vr) {
      if (vr.find((r) => r.status === 'approved')) {
        return {
          result: COMPLETED,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request has been approved. Visit',
            text: 'Me > Vehicle Dashboard',
            suffix: 'for details.'
          }
        };
      } else if (vr.find((r) => r.status === 'pending')) {
        return {
          result: WAITING,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request is pending review. Visit',
            text: 'Me > Vehicle Dashboard',
            suffix: 'to adjust or delete your request.'
          }
        };

      } else if (vr.find((r) => r.status === 'rejected')) {
        return {
          result: URGENT,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request has been denied. Visit',
            text: 'Me > Vehicle Dashboard',
            suffix: 'for details.'
          }
        };
      }
    }
    if (milestones.ignore_pvr) {
      return {
        name: 'Personal Vehicle Request Eligible (muted)',
        result: COMPLETED,
        message: 'You have chosen to mute the Personal Vehicle request.',
      };
    }
    return {
      result: ACTION_NEEDED,
      linkedMessage: {
        route: 'me.vehicles',
        prefix: 'You are eligible to submit vehicle requests and reauthorizations for driving stickers and other items. Visit',
        text: 'Me > Vehicle Dashboard',
        suffix: 'to submit a request or to mute this step.'
      }
    };
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
      route: 'me.agreements',
      linkedMessage: {
        route: 'me.agreements',
        prefix: htmlSafe('Starting late 2022, all Clubhouse users who have been granted either the Login Management Year Round or On Playa roles are required EACH CALENDAR YEAR to review and agree to the Sensitive Data Access and Use Policy document. <b class="text-danger">Your privileges are suspended until the document is agreed to.</b><br><br> Visit'),
        text: 'Me > Agreements',
        suffix: 'to review and agree to the document.'
      },
    };
  }
};

export const AFTER_EVENT_STATUS_ADVISORY = {
  period: AFTER_EVENT,

  check({person}) {
    const {status} = person;

    if (status !== RETIRED && status !== INACTIVE && status !== INACTIVE_EXTENSION) {
      return {result: SKIP};
    }

    if (status === RETIRED) {
      return {
        name: 'Retired Status',
        email: 'VCEmail',
        result: ACTION_NEEDED,
        message: htmlSafe("<p>Because you have not worked in 5 or more events, your status is now 'retired.'</p>" +
          "<p>If you wish to volunteer with the Rangers next event, you will need to attend a full day's " +
          "In-Person Training, and walk a Cheetah Cub shift with a Mentor.</p> Contact the Volunteer Coordinators for more information.")
      };
    } else {
      return {
        name: `Inactive ${person.status === INACTIVE_EXTENSION ? 'Extension ' : ''}Status`,
        email: 'VCEmail',
        result: ACTION_NEEDED,
        message: htmlSafe(`<p>Because you have not worked in 3 or more events, your status is now '${status}.'<p>` +
          "<p>If you wish to volunteer with the Rangers next event, you will need to attend a full day's " +
          "In-Person Training, and work a shift.</p>Contact the Volunteer Coordinators for more information.")
      };
    }
  }
}
