import {htmlSafe} from '@ember/string';
import {config} from 'clubhouse/utils/config';
import moment from 'moment';
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

function indefiniteArticle(noun) {
  return (noun.match(/^[aeiou]/i) ? `an ${noun}` : `a ${noun}`);
}

export const UPLOAD_PHOTO = {
  name: 'Upload a BMID Photo',
  immediate: true,
  check({photo, isPNV}) {
    if (photo.photo_status !== 'missing') {
      return {result: isPNV ? COMPLETED : SKIP};
    }

    if (!photo.upload_enabled) {
      return {
        result: WAITING,
        message: 'Photo uploading is not available at this time. Check back later.',
      }
    }
    return {result: ACTION_NEEDED, isPhotoStep: true};
  }
};

export const PHOTO_APPROVAL = {
  name: 'Photo Approval',
  check({photo, isPNV}) {
    let reasons, message;
    switch (photo.photo_status) {
      case 'approved':
        return {result: isPNV ? COMPLETED : SKIP};
      case 'submitted':
        return {
          result: WAITING,
          message: 'The photo is being reviewed. Usually photos are approved within 2 to 3 days.',
        }
      case 'rejected':
        reasons = photo.rejections.map((reason) => `<li>${reason}</li>`).join('');
        message = `Your photo was rejected for the following reasons: <ul>${reasons}</ul>`;
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
      message = `${timesheets_unverified} timesheet ${timesheets_unverified === 1 ? 'entry' : 'entries'} needs to be verified.`;
    } else {
      message = '';
    }
    return {
      result: ACTION_NEEDED,
      route: 'me.timesheet-corrections',
      linkedMessage: {
        route: 'me.timesheet-corrections',
        prefix: message + ' Visit',
        text: 'Me > Timesheet Corrections',
        suffix: 'to verify your timesheet entries, submit corrections, and confirm all entries are correct.'
      }
    };
  }
};

export const VERIFY_PERSONAL_INFO = {
  name: 'Review and Update Personal Information',
  check({milestones, isPNV}) {
    if (milestones.has_reviewed_pi) {
      return {result: isPNV ? COMPLETED : SKIP};
    }

    return {
      result: ACTION_NEEDED,
      route: 'me.personal-info',
      linkedMessage: {
        route: 'me.personal-info',
        prefix: 'Visit',
        text: 'Me > Personal Info',
        suffix: 'and click the Update button at the bottom of the page to save your changes ' +
          'or to verify that the existing information is correct.',
      },
    };
  }
};

export const ONLINE_TRAINING = {
  name: 'Read the Ranger Manual & Complete Part 1 of Training (online)',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, isAuditor, prevCompleted}) {
    if (milestones.online_training_passed) {
      return {result: (isPNV || isAuditor) ? COMPLETED : SKIP};
    }

    if (!milestones.online_training_enabled) {
      return {
        result: WAITING,
        message: 'Part 1 of Training (online) is not quite ready yet. Check back later.'
      }
    }

    if (isPNV && !prevCompleted) {
      return { result: NOT_AVAILABLE, message: 'You must complete the previous steps before being allowed to take online Training.' }
    }

    return {
      result: ACTION_NEEDED,
      message: htmlSafe('<p>The Ranger Manual can be found at <a href="' + config('RangerManualUrl') + '" rel="noopener" target="_blank">rangers.burningman.org</a>.</p>' +
        '<p>The online training will take 1 to 2 hours to complete. </p> <p>Note: it may take up to 15 mins or more for the Clubhouse to record your course completion.</p>'),
      isOnlineTraining: true,
    };
  }
};

export const SIGN_UP_FOR_TRAINING = {
  name: 'Sign up for Part 2 of Training (face-to-face)',
  skipPeriod: AFTER_EVENT,
  check({milestones, isPNV, isAuditor}) {
    if (milestones.training.status !== 'no-shift') {
      return {result: (isAuditor || isPNV) ? COMPLETED : SKIP};
    }

    if (!milestones.online_training_passed) {
      return {
        result: NOT_AVAILABLE,
        message: 'You need to complete Part 1 of Training (online) first before being allowed to sign up for Part 2 of Training (face-to-face).'
      };
    }

    if (milestones.trainings_available) {
      let prefix;
      if (isPNV) {
        prefix = 'You will need to sign up and pass Part 2 of Training (face-to-face) before being allowed to sign up for your Alpha shift.';
      } else if (isAuditor) {
        prefix = ''; // nada.
      } else {
        prefix = `You will to need sign up and pass Part 2 of Training (face-to-face) ${milestones.is_trainer ? 'or teach a training' : ''} before being allowed to work on playa.`;
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
        message: 'Training sign ups are not yet available and usually do not open until mid-to-late April. Please check back later.'
      };
    }
  }
};

export const ATTEND_TRAINING = {
  name: 'Attend Part 2 of Training (face-to-face)',
  skipPeriod: AFTER_EVENT,
  check({milestones, person, isPNV, isAuditor}) {
    if (!milestones.online_training_passed || milestones.training.status === 'no-shift') {
      if (isPNV || isAuditor) {
        return {
          result: NOT_AVAILABLE,
          message: 'Please sign up for a face-to-face Training.'
        }
      }
      return {result: SKIP}
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
            return { result: COMPLETED };
          }
          return {
            result: COMPLETED,
            message: 'While you are cleared to work dirt shifts, ART shifts may require additional training.'
          }
        }

      case 'no-show': // trainer failed to show up
        return {
          result: URGENT,
          message: `You did not teach the training on ${moment(training.date).format('dddd, MMMM Do YYYY')} located at ${training.location}. You must either attend and pass training as a student OR teach a session in order to work on playa.`,
          immediate: true
        };

      case 'fail':
        return {
          result: URGENT,
          message: `You did not attend or failed to complete training on ${moment(training.date).format('dddd, MMMM Do YYYY')} located at ${training.location}. Email the Training Academy to sign up for another session.`,
          email: 'TrainingAcademyEmail',
          immediate: true
        };

      case 'pending': {
        let prefix, dt;
        if (training.is_trainer) {
          prefix = 'You are signed up to teach a training session. Once you have been marked as having taught the session, you will be considered "trained" and able to work on playa';
          dt = 'ddd MMM DD [@] HH:mm';
        } else if (milestones.needs_full_training || isAuditor || isPNV) {
          if (isAuditor) {
            prefix = "Attend the FULL DAY training";
          } else {
            prefix = 'Because you are ';
            if (milestones.is_binary) {
              prefix += 'a binary Ranger (0 or 1 years experience)'
            } else if (isPNV) {
              prefix += 'a prospective Ranger'
            } else {
              prefix += ` ${indefiniteArticle(person.status)} Ranger`;
            }
            prefix += ', you have to attend the <b>FULL DAY training</b>';
          }
          dt = 'ddd MMM DD [@] HH:mm';
        } else {
          prefix = 'As a returning Ranger, you only need to attend the half day training portion';
          dt = 'ddd MMM DD';
        }
        prefix += `:<div class="my-2">${moment(training.date).format(dt)}  - ${training.location}.</div>Visit`;
        return {
          result: ACTION_NEEDED,
          linkedMessage: {
            route: 'me.schedule',
            prefix: htmlSafe(prefix),
            text: 'Me > Schedule / Sign Up',
            suffix: 'to remove your sign up from the schedule if you cannot make it.'
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
        result: ACTION_NEEDED,
        message: 'Please take a moment to provide feedback on your face-to-face training experience:',
        survey: 'student'
      };

    }
    return {result: SKIP}; // Only show the step IF a survey is available (marked as passed training, and a survey has been created)
  }
};

export const SIGN_UP_FOR_SHIFTS = {
  name: 'Sign up for shifts',
  skipPeriod: AFTER_EVENT,

  check({milestones, person}) {
    if (!milestones.online_training_passed && ! person.isNonRanger) {
      return {
        result: NOT_AVAILABLE,
        message: 'You need to complete Part 1 of Training (online) first before being allowed to sign up shifts.'
      };
    }

    if (!milestones.dirt_shifts_available) {
      return {
        result: NOT_AVAILABLE,
        message: 'The full Ranger schedule is not available yet. Usually the schedule is posted in June.',
      };
    }

    if (milestones.shift_signups) {
      return {
        result: COMPLETED,
        sticky: true, // keep sorted close to the top
        route: 'me.schedule',
        linkedMessage: {
          route: 'me.schedule',
          prefix:
            `You are signed up for ${milestones.shift_signups} shift${milestones.shift_signups === 1 ? '' : 's'}. Visit`,
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
        prefix: 'Shift sign ups are available.',
        text: 'Me > Schedule / Sign Up',
        suffix: `to ${milestones.shift_signups ? 'adjust your schedule' : 'sign up for shifts'}.`
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
      message: 'All volunteers are asked to sign the optional Behavioral Standards Agreement.',
      isBehavioralAgreement: true
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
      route: 'me.motorpool-policy',
      linkedMessage: {
        route: 'me.motorpool-policy',
        prefix: 'Comfortable driving a Ranger gator, golf cart, or UTV while on shift? Visit',
        text: 'Me > Motorpool Policy',
        suffix: 'to review and agree to the Motorpool Policy.'
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



