/** Stable storage-format identifiers; no schema or limits change. */

export const ACTIVE_GUN = 'activeGunId';

export const MAX_EXAMPLES_PER_CLASS = 10;

export const MAX_COMPATIBLE_EXAMPLES_PER_CLASS = 50;

export const MAX_GUNS = 5;

export const GUN_TYPES = Object.freeze(['Handguns', 'Rifles and Carbines', 'Shotguns']);

export const DRILL_OUTCOMES = ['matched', 'completed', 'incorrect', 'unknown'];

export const SESSION_STATUSES = ['running', 'paused', 'completed', 'ended', 'interrupted'];

export const TERMINAL_SESSION_STATUSES = ['completed', 'ended', 'interrupted'];
