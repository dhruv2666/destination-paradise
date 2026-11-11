// Mauritius public holidays + festive greetings. Lunar-based dates are approximate
// (they are officially confirmed each year by the government).
export type Holiday = { date: string; name: string; greeting: string; emoji: string };

export const HOLIDAYS: Holiday[] = [
  // 2026
  { date: "2026-01-01", name: "New Year", greeting: "Happy New Year!", emoji: "🎉" },
  { date: "2026-01-02", name: "New Year", greeting: "Happy New Year!", emoji: "🎉" },
  { date: "2026-02-01", name: "Abolition of Slavery", greeting: "Abolition of Slavery Day", emoji: "🕊️" },
  { date: "2026-02-15", name: "Maha Shivaratree", greeting: "Happy Maha Shivaratree!", emoji: "🔱" },
  { date: "2026-02-17", name: "Chinese Spring Festival", greeting: "Happy Chinese New Year!", emoji: "🧧" },
  { date: "2026-03-12", name: "Independence Day", greeting: "Happy Independence Day, Mauritius!", emoji: "🇲🇺" },
  { date: "2026-03-19", name: "Ougadi", greeting: "Happy Ougadi!", emoji: "🌼" },
  { date: "2026-03-21", name: "Eid ul-Fitr", greeting: "Eid Mubarak!", emoji: "🌙" },
  { date: "2026-05-01", name: "Labour Day", greeting: "Happy Labour Day!", emoji: "🛠️" },
  { date: "2026-08-15", name: "Assumption", greeting: "Happy Assumption Day", emoji: "⛪" },
  { date: "2026-09-15", name: "Ganesh Chaturthi", greeting: "Happy Ganesh Chaturthi!", emoji: "🐘" },
  { date: "2026-11-02", name: "Arrival of Indentured Labourers", greeting: "Arrival of Indentured Labourers Day", emoji: "⚓" },
  { date: "2026-11-08", name: "Divali", greeting: "Happy Diwali!", emoji: "🪔" },
  { date: "2026-12-25", name: "Christmas", greeting: "Merry Christmas!", emoji: "🎄" },
  // 2027
  { date: "2027-01-01", name: "New Year", greeting: "Happy New Year!", emoji: "🎉" },
  { date: "2027-01-02", name: "New Year", greeting: "Happy New Year!", emoji: "🎉" },
  { date: "2027-02-01", name: "Abolition of Slavery", greeting: "Abolition of Slavery Day", emoji: "🕊️" },
  { date: "2027-02-06", name: "Chinese Spring Festival", greeting: "Happy Chinese New Year!", emoji: "🧧" },
  { date: "2027-03-06", name: "Maha Shivaratree", greeting: "Happy Maha Shivaratree!", emoji: "🔱" },
  { date: "2027-03-10", name: "Eid ul-Fitr", greeting: "Eid Mubarak!", emoji: "🌙" },
  { date: "2027-03-12", name: "Independence Day", greeting: "Happy Independence Day, Mauritius!", emoji: "🇲🇺" },
  { date: "2027-04-07", name: "Ougadi", greeting: "Happy Ougadi!", emoji: "🌼" },
  { date: "2027-05-01", name: "Labour Day", greeting: "Happy Labour Day!", emoji: "🛠️" },
  { date: "2027-08-15", name: "Assumption", greeting: "Happy Assumption Day", emoji: "⛪" },
  { date: "2027-09-05", name: "Ganesh Chaturthi", greeting: "Happy Ganesh Chaturthi!", emoji: "🐘" },
  { date: "2027-10-29", name: "Divali", greeting: "Happy Diwali!", emoji: "🪔" },
  { date: "2027-11-02", name: "Arrival of Indentured Labourers", greeting: "Arrival of Indentured Labourers Day", emoji: "⚓" },
  { date: "2027-12-25", name: "Christmas", greeting: "Merry Christmas!", emoji: "🎄" },
];

/** Local YYYY-MM-DD in Mauritius time. */
export function mauritiusDate(d = new Date()) {
  return new Date(d.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
}

export function holidayToday(today = mauritiusDate()) {
  return HOLIDAYS.find((h) => h.date === today) ?? null;
}

export function nextHoliday(today = mauritiusDate()) {
  return HOLIDAYS.find((h) => h.date > today) ?? null;
}
