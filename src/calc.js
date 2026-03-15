// Arknights — Orundum and HH Permit Calculator

const ORUNDUM_PER_DAY     = 300;
const ORUNDUM_MONDAY      = 1800;
const ORUNDUM_WEDNESDAY   = 500;
const ORUNDUM_MONTH_FIRST = 600;

const HH_MONTH_FIRST = 4;
const HH_DAY_17      = 1;
const ORUNDUM_PER_HH = 600;

/**
 * @param {Date} dateStart
 * @param {Date} dateEnd
 * @returns {{ days: number, mondays: number, wednesdays: number, month_firsts: number,
 *             daily_total: number, monday_total: number, wednesday_total: number,
 *             month_first_total: number, grand_total: number }}
 */
function calculateOrundum(dateStart, dateEnd) {
  let days        = 0;
  let mondays     = 0;
  let wednesdays  = 0;
  let monthFirsts = 0;

  const current = new Date(dateStart);
  current.setHours(0, 0, 0, 0);
  const end = new Date(dateEnd);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    days++;
    if (current.getDay() === 1) mondays++;
    if (current.getDay() === 3) wednesdays++;
    if (current.getDate() === 1) monthFirsts++;
    current.setDate(current.getDate() + 1);
  }

  const dailyTotal      = days        * ORUNDUM_PER_DAY;
  const mondayTotal     = mondays     * ORUNDUM_MONDAY;
  const wednesdayTotal  = wednesdays  * ORUNDUM_WEDNESDAY;
  const monthFirstTotal = monthFirsts * ORUNDUM_MONTH_FIRST;
  const grandTotal      = dailyTotal + mondayTotal + wednesdayTotal + monthFirstTotal;

  return {
    days,
    mondays,
    wednesdays,
    month_firsts:       monthFirsts,
    daily_total:        dailyTotal,
    monday_total:       mondayTotal,
    wednesday_total:    wednesdayTotal,
    month_first_total:  monthFirstTotal,
    grand_total:        grandTotal,
  };
}

/**
 * @param {Date} dateStart
 * @param {Date} dateEnd
 * @returns {{ month_firsts: number, day_seventeenths: number,
 *             month_first_total: number, day_17_total: number, grand_total: number }}
 */
function calculateHhPermit(dateStart, dateEnd) {
  let monthFirsts    = 0;
  let daySeventeenths = 0;

  const current = new Date(dateStart);
  current.setHours(0, 0, 0, 0);
  const end = new Date(dateEnd);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    if (current.getDate() === 1)  monthFirsts++;
    if (current.getDate() === 17) daySeventeenths++;
    current.setDate(current.getDate() + 1);
  }

  const monthFirstTotal    = monthFirsts     * HH_MONTH_FIRST;
  const day17Total         = daySeventeenths * HH_DAY_17;
  const grandTotal         = monthFirstTotal + day17Total;

  return {
    month_firsts:       monthFirsts,
    day_seventeenths:   daySeventeenths,
    month_first_total:  monthFirstTotal,
    day_17_total:       day17Total,
    grand_total:        grandTotal,
  };
}

/**
 * @param {Date} dateStart
 * @param {Date} dateEnd
 * @returns {{ orundum: ReturnType<calculateOrundum>, hh: ReturnType<calculateHhPermit> & { from_orundum: number, total: number } }}
 * @throws {Error} if dateStart > dateEnd
 */
export function calculate(dateStart, dateEnd) {
  const start = new Date(dateStart);
  const end   = new Date(dateEnd);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    throw new Error('dateStart must be before or equal to dateEnd.');
  }

  const orundum = calculateOrundum(start, end);
  const hh      = calculateHhPermit(start, end);

  const hhFromOrundum = Math.floor(orundum.grand_total / ORUNDUM_PER_HH);
  const hhTotal       = hh.grand_total + hhFromOrundum;

  return {
    orundum,
    hh: {
      ...hh,
      from_orundum: hhFromOrundum,
      total:        hhTotal,
    },
    constants: {
      ORUNDUM_PER_DAY,
      ORUNDUM_MONDAY,
      ORUNDUM_WEDNESDAY,
      ORUNDUM_MONTH_FIRST,
      HH_MONTH_FIRST,
      HH_DAY_17,
      ORUNDUM_PER_HH,
    },
  };
}
