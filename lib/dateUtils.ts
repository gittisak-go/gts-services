import { format, parse, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const BANGKOK_TIMEZONE = "Asia/Bangkok";

/**
 * Get current date in Bangkok timezone
 */
export const getBangkokDate = (): Date => {
  return toZonedTime(new Date(), BANGKOK_TIMEZONE);
};

/**
 * Convert date to Bangkok timezone
 */
export const toBangkokDate = (date: Date): Date => {
  return toZonedTime(date, BANGKOK_TIMEZONE);
};

/**
 * Get start of day in Bangkok timezone
 */
export const getStartOfDayBangkok = (date: Date): Date => {
  const bangkokDate = toBangkokDate(date);
  const start = startOfDay(bangkokDate);
  return fromZonedTime(start, BANGKOK_TIMEZONE);
};

/**
 * Get end of day in Bangkok timezone
 */
export const getEndOfDayBangkok = (date: Date): Date => {
  const bangkokDate = toBangkokDate(date);
  const end = endOfDay(bangkokDate);
  return fromZonedTime(end, BANGKOK_TIMEZONE);
};

/**
 * Format date to YYYY-MM-DD string (Bangkok timezone)
 */
export const formatDateString = (date: Date): string => {
  const bangkokDate = toBangkokDate(date);
  return format(bangkokDate, "yyyy-MM-dd");
};

/**
 * Parse YYYY-MM-DD string to Date (Bangkok timezone)
 * Note: date-fns-tz handles this differently, we need to treat the string as local time
 */
export const parseDateString = (dateString: string): Date => {
  // Parse as local time, then convert to Bangkok timezone representation
  const parsed = parse(dateString, "yyyy-MM-dd", new Date());
  return parsed;
};

/**
 * Get today date in Bangkok timezone (start of day)
 */
export const getTodayBangkok = (): Date => {
  const today = getBangkokDate();
  return getStartOfDayBangkok(today);
};

/**
 * Get maximum booking date (1 year from today, end of year)
 * ถ้าวันนี้ 1 มกราคม 2568 จะจองได้ถึง 31 ธันวาคม 2568
 */
export const getMaxBookingDate = (): Date => {
  const today = getTodayBangkok();
  const bangkokToday = toBangkokDate(today);

  // Calculate next year's December 31
  const nextYear = bangkokToday.getFullYear() + 1;
  const maxDate = new Date(nextYear, 11, 31); // December 31

  // Convert to Bangkok timezone
  return toBangkokDate(maxDate);
};

/**
 * Check if date is within booking range (today to 1 year ahead)
 */
export const isDateInBookingRange = (date: Date): boolean => {
  const today = getTodayBangkok();
  const maxDate = getMaxBookingDate();
  const checkDate = toBangkokDate(date);
  const todayBangkok = toBangkokDate(today);
  const maxBangkok = toBangkokDate(maxDate);

  // Compare dates at start of day
  const todayStart = new Date(
    todayBangkok.getFullYear(),
    todayBangkok.getMonth(),
    todayBangkok.getDate()
  );
  const maxStart = new Date(
    maxBangkok.getFullYear(),
    maxBangkok.getMonth(),
    maxBangkok.getDate()
  );
  const checkStart = new Date(
    checkDate.getFullYear(),
    checkDate.getMonth(),
    checkDate.getDate()
  );

  return checkStart >= todayStart && checkStart <= maxStart;
};

/**
 * Format date for display (Thai format)
 */
export const formatDateThai = (date: Date): string => {
  const bangkokDate = toBangkokDate(date);
  const days = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  return `${days[bangkokDate.getDay()]}ที่ ${bangkokDate.getDate()} ${
    months[bangkokDate.getMonth()]
  } ${bangkokDate.getFullYear() + 543}`;
};

/**
 * Format date short (DD/MM/YYYY)
 */
export const formatDateShort = (date: Date): string => {
  const bangkokDate = toBangkokDate(date);
  return `${bangkokDate.getDate()}/${bangkokDate.getMonth() + 1}/${
    bangkokDate.getFullYear() + 543
  }`;
};

/**
 * Get days count between two dates
 */
export const getDaysCount = (startDate: Date, endDate: Date): number => {
  const start = getStartOfDayBangkok(startDate);
  const end = getStartOfDayBangkok(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
