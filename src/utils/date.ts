// Dates are stored as YYYY-MM-DD strings, the value format of a date input

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  // A YYYY-MM-DD string is parsed as midnight UTC
  timeZone: "UTC",
});

// A date picker also accepts years like 275760, which cannot be shown
export const MIN_DATE = "1900-01-01";
export const MAX_DATE = "2099-12-31";

export const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  value >= MIN_DATE &&
  value <= MAX_DATE;

// Today in the time zone of the user, not in UTC
export const getToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const formatDate = (date: string) =>
  isIsoDate(date) ? dateFormat.format(new Date(date)) : date;

export const formatDateRange = (startDate?: string, dueDate?: string) => {
  if (startDate && dueDate) {
    return `${formatDate(startDate)} – ${formatDate(dueDate)}`;
  }
  if (startDate) {
    return `Starts ${formatDate(startDate)}`;
  }
  if (dueDate) {
    return `Due ${formatDate(dueDate)}`;
  }
  return undefined;
};
