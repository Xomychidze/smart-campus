// Single source of truth for constants (fixes v1 risks R1 and R5).

/** AC2: maximum booking length in minutes. */
export const MAX_DURATION_MINUTES = 120;

/** Fixed "current time" of the prototype (fictional). */
export const CURRENT_TIME = "2026-11-09 09:00";

/** AC1: 24-hour HH:MM time. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
