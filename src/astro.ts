// rotating mount settings
const DECLINATION_DIAL = 0;         // initial rotation, pointing North
const DECLINATION_DIRECTION = -1;   // rotation direction: 1 = CW / -1 = CCW

// a floating degree number
type Degree = number;

// a Declination representation in degrees and arc-minutes
export interface Declination {
  degree: Degree;
  minute: number;
}

// an HourAngle representation in hours, minutes, seconds
export interface HourAngle {
  hour: number;
  minute: number;
  second: number;
}

// a unique item with a name, coordinates, and a timestamp of when it was last updated
export interface SkyObject {
  id: string;
  name: string;
  declination: Declination;
  hourAngle: HourAngle;
  timestamp: Date;
}

// simple two-digit rounding
function decimalRound(degree: number): number {
  return Math.floor(degree * 100) / 100;
}

// decimal representation of an hour-angle
function decimalHour(hourAngle: HourAngle) {
  return decimalRound(hourAngle.hour + hourAngle.minute / 60 + hourAngle.second / 3600);
}

/**
 * Returns an absolute degree number on a 360 circle
 */
export function absoluteDegree(degree: Degree): Degree {
  if (degree < 0) {
    return 360 - Math.abs(degree) % 360;
  }

  return degree % 360;
}

/**
 * Adds seconds to an hour-angle, returning a new hour-angle
 */
export function addTimeToHourAngle(hourAngle: HourAngle, seconds: number): HourAngle {
  const totalSeconds = hourAngle.second + seconds;
  const totalMinutes = hourAngle.minute + Math.floor(totalSeconds / 60);
  const totalHours = hourAngle.hour + Math.floor(totalMinutes / 60);

  return {
    hour: totalHours % 24,
    minute: totalMinutes % 60,
    second: totalSeconds % 60,
  };
}

/**
 * Converts an HourAngle object to Degrees.
 * Since HourAngle is from 0 to 24, this function will return a degree between 0 and 360.
 */
function hourAngleToDegrees(hourAngle: HourAngle): Degree {
  return decimalHour(hourAngle) * 15;
}

/**
 * Returns a floating Degree number of a Declination point.
 * Declination is a degree between -90.0 and +90.0
 */
function declinationToDegrees(declination: Declination): Degree {
  return decimalRound(Math.sign(declination.degree) * (Math.abs(declination.degree) + declination.minute / 60));
}

/**
 * Calculates the rotation Degree for Declination.
 * Takes into account the original degree of rotation for the dial, as well as the direction of the gradations on the dial.
 */
export function declinationDegree(declination: Declination, hourAngle: HourAngle): Degree {
  // DECLINATION_DIAL + DECLINATION_ROTATION * sign(ha - 180) * (90 - xDecl)
  const declinationRotation = DECLINATION_DIAL + DECLINATION_DIRECTION * Math.sign(decimalHour(hourAngle) - 12) * (90 - declinationToDegrees(declination));
  return absoluteDegree(decimalRound(declinationRotation));
}

/**
 * Calculates the rotation Degree for HourAngle.
 */
export function hourAngleDegree(hourAngle: HourAngle) {
  // ha - 90 - floor(ha/180)*180
  const hourAngleRotation = hourAngleToDegrees(hourAngle) - 90 - Math.floor(hourAngle.hour / 12) * 180;
  return absoluteDegree(hourAngleRotation);
}
