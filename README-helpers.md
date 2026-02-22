# Ember.js Helpers Reference

All helpers are located in `app/helpers/` and can be used directly in Handlebars templates.

---

## Date & Time Formatting

### `dayjs-format`
General-purpose date formatting using dayjs. If no date is provided, uses the current date/time.

```handlebars
{{dayjs-format someDate "YYYY-MM-DD"}}
{{dayjs-format null "HH:mm"}}  {{!-- formats current time --}}
```
**Params:** `[date, format]`

---

### `full-datetime-format`
Formats a date as a full human-readable datetime string.

```handlebars
{{full-datetime-format createdAt}}
{{!-- "Wednesday, August 7th, 2024 @ 14:30" --}}
```
**Params:** `[date]` — Returns empty string if falsy. Format: `dddd, MMMM Do, YYYY @ HH:mm`

---

### `mdy-format`
Formats a date as month-day-year. Supports a short and full format.

```handlebars
{{mdy-format someDate}}            {{!-- "Aug 07, 2024" --}}
{{mdy-format someDate full=true}}  {{!-- "Wednesday, August 7th 2024" --}}
```
**Params:** `[date]` — **Named:** `full` (boolean)

---

### `ymd-format`
Formats a date as `YYYY-MM-DD`.

```handlebars
{{ymd-format someDate}}  {{!-- "2024-08-07" --}}
```
**Params:** `[date]`

---

### `year-format`
Extracts just the year from a datetime.

```handlebars
{{year-format createdAt}}  {{!-- "2024" --}}
```
**Params:** `[date]` — Returns empty string if falsy.

---

### `time-format`
Formats a date/datetime as `HH:mm` (24-hour time).

```handlebars
{{time-format someDate}}  {{!-- "14:30" --}}
```
**Params:** `[date]`

---

### `timestamp-format`
Converts a UTC-7 absolute timestamp to Pacific time. Many database timestamps are stored as UTC-7 rather than true UTC.

```handlebars
{{timestamp-format rawTimestamp}}                          {{!-- "2024-08-07 14:30:00" --}}
{{timestamp-format rawTimestamp "MMM DD, YYYY HH:mm"}}    {{!-- custom format --}}
```
**Params:** `[time, format]` — Default format: `YYYY-MM-DD HH:mm:ss`

---

### `shift-format`
Formats shift start/end times with timezone awareness. Displays local time in a tooltip.

```handlebars
{{shift-format slot.begins slot.ends}}
{{shift-format slot.begins slot.ends tz="America/Denver" tzabbr="MDT"}}
{{shift-format slot.begins}}                  {{!-- start time only --}}
{{shift-format slot.begins slot.ends year=true}}  {{!-- include year --}}
```
**Params:** `[start, end]` — **Named:** `tz` (timezone string), `tzabbr` (timezone abbreviation), `year` (boolean). Default timezone: `America/Los_Angeles`. Returns `htmlSafe`.

**Exported constants:** `MONTH_DAY_TIME`, `MONTH_DAY_TIME_YEAR`, `HOUR_MINS`, `HOUR_MIN_DAY`

---

### `is-current-year`
Returns `true` if the given year matches the current year.

```handlebars
{{#if (is-current-year 2024)}}Current year!{{/if}}
```
**Params:** `[year]`

---

### `year-range`
Compresses an array of years into a human-readable range string.

```handlebars
{{year-range this.rangerYears}}
{{!-- e.g. "2018 - 2020, 2022, 2024" --}}
```
**Params:** `[years]` (sorted array of numbers) — Returns `"none"` for empty arrays.

---

## Duration & Time Calculations

### `hour-format`
Converts a duration in **seconds** to decimal hours.

```handlebars
{{hour-format 7200}}  {{!-- "2.00" --}}
```
**Params:** `[duration]` (seconds) — Returns `"0.00"` if falsy.

---

### `hour-minute-format`
Converts a duration in **seconds** to `H:MM` format with screen-reader-friendly markup.

```handlebars
{{hour-minute-format 5400}}  {{!-- displays "1:30", reads as "1 hours 30 minutes" --}}
```
**Params:** `[duration]` (seconds) — Returns `htmlSafe`. Includes `<span class="sr-only">` for accessibility.

---

### `hour-minute-words`
Converts a duration in **seconds** to human-readable words.

```handlebars
{{hour-minute-words 5400}}  {{!-- "1 hour 30 mins" --}}
{{hour-minute-words 120}}   {{!-- "2 mins" --}}
```
**Params:** `[duration]` (seconds)

---

## Number & Text Formatting

### `credits-format`
Formats a numeric value to two decimal places (for credit display).

```handlebars
{{credits-format 1.5}}   {{!-- "1.50" --}}
{{credits-format null}}   {{!-- "0.00" --}}
```
**Params:** `[credits]`

---

### `yesno`
Converts a boolean to `"Y"` or `"N"`.

```handlebars
{{yesno person.on_site}}  {{!-- "Y" or "N" --}}
```
**Params:** `[value]`

---

### `nl2br`
Converts newlines to `<br>` tags. HTML-escapes content by default.

```handlebars
{{nl2br someText}}
{{nl2br someHtml allowHtml=true}}  {{!-- skips escaping --}}
```
**Params:** `[text]` — **Named:** `allowHtml` (boolean). Returns `htmlSafe`.

---

### `hyperlink-text`
Auto-detects URLs in text and wraps them in `<a>` tags.

```handlebars
{{hyperlink-text someText}}
```
**Params:** `[text]` — Returns `htmlSafe`. Uses `clubhouse/utils/hyperlink-text`.

---

### `is-are`
Returns "is" or "are" (or custom singular/plural words) based on a count.

```handlebars
There {{is-are items.length}} {{items.length}} item(s).
There {{is-are count "was" "were"}} {{count}} event(s).
```
**Params:** `[length, singular, plural]` — Defaults: singular=`"is"`, plural=`"are"`.

---

### `singular-or-pluralize`
Returns "a/an word" for count=1, or "N words" for other counts.

```handlebars
{{singular-or-pluralize 1 "item"}}    {{!-- "an item" --}}
{{singular-or-pluralize 3 "item"}}    {{!-- "3 items" --}}
{{singular-or-pluralize 1 "cat" capitalize=true}}  {{!-- "A cat" --}}
```
**Params:** `[count, word]` — **Named:** `capitalize` (boolean). Uses `a`/`an` based on first letter.

---

## Icons & UI Elements

### `fa-icon`
Renders a Font Awesome icon as an `<i>` element.

```handlebars
{{fa-icon "check"}}
{{fa-icon "user" type="r"}}
{{fa-icon "spinner" spinner=true color="primary" size="2x"}}
{{fa-icon "arrow-right" right=1 fixed=true title="Next"}}
{{fa-icon "star" class="custom-class" left=2}}
```
**Params:** `[name]` — **Named:**
- `type`: `"s"`/`"fas"` (solid, default), `"r"`/`"far"` (regular), or custom
- `color`: Bootstrap color name (adds `text-{color}`)
- `size`: FA size suffix (e.g. `"2x"`, `"lg"`)
- `spinner`/`spin`: boolean, adds `fa-spin`
- `fixed`: boolean, adds `fa-fw` (fixed width)
- `class`: additional CSS class
- `right`: margin-end value (adds `me-{n}`)
- `left`: margin-start value (adds `ms-{n}`)
- `title`: title attribute

Returns `htmlSafe`.

---

### `slot-full-indicator`
Renders a Bootstrap progress bar showing slot fill status.

```handlebars
{{slot-full-indicator slot.signed_up slot.max}}
```
**Params:** `[signedUp, max]` — Displays "FULL X/Y" in red when full, yellow at >=85%, green otherwise. Returns `htmlSafe`.

---

## Data Lookup & Utility

### `assets-url`
Builds a URL to a file in the `assets/` directory.

```handlebars
<img src={{assets-url "images/logo.png"}}>
```
**Params:** `[path]` — Prepends `ENV.rootURL + "assets/"`.

---

### `setting`
Retrieves an application setting value by key.

```handlebars
{{setting "SiteName"}}
{{#if (setting "PhotoUploadEnabled")}}...{{/if}}
```
**Params:** `[key]` — Delegates to `clubhouse/utils/setting`.

---

### `set-value`
Returns a closure action that sets a property on an object. Useful for binding to component callbacks.

```handlebars
<SomeComponent @onChange={{set-value this "selectedItem"}} />
```
**Params:** `[object, propertyName]` — Returns a function `(value) => set(obj, name, value)`.

---

### `options-get`
Looks up a display label from an options array by value. Supports three option formats.

```handlebars
{{options-get this.statusOptions record.status}}
```
**Params:** `[options, lookupValue]` — Options formats:
- `{ id: value, title: label }`
- `['label', value]`
- `value` (label equals value)

Returns the matching label, or `lookupValue` if not found.

---

### `pluck`
Finds a record by ID in an array and returns a specific column value.

```handlebars
{{pluck person.id this.people "callsign" "Unknown"}}
```
**Params:** `[id, records, column, defaultValue]` — Returns `defaultValue` if record not found.

---

### `sum-column`
Sums a numeric column across an array of objects.

```handlebars
{{sum-column this.timesheets "duration"}}
```
**Params:** `[rows, column]` — Works with both plain objects and Ember Data models.

---

## Role & Auth

### `has-role`
Checks if the current logged-in user has one or more roles. Supports OR (multiple params) and AND (`+`-joined).

```handlebars
{{#if (has-role "admin")}}Admin content{{/if}}
{{#if (has-role "admin" "manage")}}Admin or manage{{/if}}
{{#if (has-role "admin+manage")}}Admin AND manage{{/if}}
```
**Params:** `[...roleNames]` — Role names from `clubhouse/constants/roles`. Returns boolean. Class-based helper (accesses `session` service).

---

### `has-alert-phone`
Checks if a phone number exists for an alert based on on/off playa status.

```handlebars
{{#if (has-alert-phone alert this.phoneNumbers)}}...{{/if}}
```
**Params:** `[alert, numbers]` — `alert.on_playa` determines which phone set to check.

---

## Person & Profile

### `pronouns-format`
Formats a person's pronouns, optionally wrapped in parentheses.

```handlebars
{{pronouns-format person}}             {{!-- "(they/them)" --}}
{{pronouns-format person noParens=true}}  {{!-- "they/them" --}}
```
**Params:** `[person]` — **Named:** `noParens` (boolean). Handles `"custom"` pronoun type via `person.pronouns_custom`.

---

### `phone-link`
Renders a phone number as a clickable `tel:` link.

```handlebars
{{phone-link "+15551234567"}}
{{!-- <a href="tel:+15551234567">+15551234567</a> --}}
```
**Params:** `[number]` — Returns `htmlSafe`.

---

## Position & Team

### `position-label`
Renders a position title with an "inactive" badge if the position is not active.

```handlebars
{{position-label position}}
{{position-label position true}}  {{!-- muted style for inactive --}}
```
**Params:** `[position, muted]` — Returns `htmlSafe`.

---

### `team-title`
Renders a team title with an "[inactive]" suffix if the team is not active.

```handlebars
{{team-title team}}
```
**Params:** `[team]` — Returns `htmlSafe`. Returns `"NULL"` if no team provided.

---

## Ticket & Access Documents

### `ticket-status`
Renders a colored status label for a ticket.

```handlebars
{{ticket-status "qualified"}}  {{!-- green "Available" --}}
{{ticket-status "expired"}}    {{!-- red "Expired" --}}
```
**Params:** `[status]` — Statuses: `qualified`, `banked`, `claimed`, `submitted`, `expired`, `used`. Returns `htmlSafe`.

---

### `ticket-type-human`
Converts a ticket type code to a human-readable label.

```handlebars
{{ticket-type-human "staff_credential"}}
{{ticket-type-human "staff_credential" short=true}}
```
**Params:** `[type]` — **Named:** `short` (boolean). Uses labels from `access-document` model.

---

## Training & Mentoring

### `training-pass-badge`
Renders a green "passed" or red "not passed" badge for training status.

```handlebars
{{training-pass-badge true}}   {{!-- green "training passed" badge --}}
{{training-pass-badge false}}  {{!-- red "training not passed" badge --}}
```
**Params:** `[passed]` — Returns `htmlSafe`.

---

### `training-status-badge`
Renders a colored badge for training status.

```handlebars
{{training-status-badge "pass"}}     {{!-- green "training passed" --}}
{{training-status-badge "no pass"}}  {{!-- red "training not passed" --}}
{{training-status-badge "pending"}}  {{!-- blue "training pending" --}}
{{training-status-badge "none"}}     {{!-- plain text "no training sign-up" --}}
```
**Params:** `[status]` — Statuses: `none`, `no pass`, `pass`, `pending`. Returns `htmlSafe` (except `none`).

---

### `mentee-status-badge`
Renders a colored badge for a mentee's status based on account status, mentor verdict, and alpha sign-up.

```handlebars
{{mentee-status-badge person.status mentorStatus alphaShifts}}
```
**Params:** `[accountStatus, mentorStatus, alphaShifts]` — Handles UBERBONKED accounts, missing alpha sign-ups, and mentor verdicts (`pass`, `bonk`, `self-bonk`, `pending`). Returns `htmlSafe`.

---

### `mentor-short-status`
Converts a mentor status to a short abbreviation.

```handlebars
{{mentor-short-status "bonked"}}     {{!-- "B" --}}
{{mentor-short-status "pass"}}       {{!-- "P" --}}
{{mentor-short-status "self-bonk"}}  {{!-- "SB" --}}
```
**Params:** `[status]`

---

## Application Helpers

### `application-status-label`
Converts a prospective application status code to a human-readable label.

```handlebars
{{application-status-label "approved"}}
```
**Params:** `[status]` — Uses `StatusLabels` from the `prospective-application` model. Returns `"Bug: {status}"` for unknown statuses.

---

### `application-status-color`
Returns a CSS color class for a prospective application status.

```handlebars
<span class="text-{{application-status-color status}}">{{application-status-label status}}</span>
```
**Params:** `[status]` — Uses `StatusColors` from the `prospective-application` model.

---

### `application-staleness-class`
Returns a CSS class based on how old a date is (for indicating freshness of application activity).

```handlebars
<td class="{{application-staleness-class record.updated_at}}">...</td>
```
**Params:** `[date]` — Returns:
- `"staleness-fresh"` — 0-3 days old
- `"staleness-aging"` — 4-7 days old
- `"staleness-stale"` — 8+ days or no date
