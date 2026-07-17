/**
 * Application-wide constants for the Investa Client Portal
 * Centralized configuration values to avoid magic numbers
 */
/**
 * User Types - matches backend UserType enum
 * Two types only: OrgUser (internal staff) and Client (all external users)
 */
export const UserTypes = {
    ORG_USER: 'OrgUser',
    CLIENT: 'Client'
};
/**
 * User Roles - for backward compatibility with legacy code
 * Note: All external users (investors, founders, partners) are "Client" type
 */
export const UserRoles = {
    ORG_USER: 'OrgUser',
    CLIENT: 'Client'
};
/**
 * Investment Types
 */
export const InvestmentTypes = {
    FOUNDING: 'founding',
    EQUITY: 'equity'
};
/**
 * Investment Status
 */
export const InvestmentStatus = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};
/**
 * Client Status IDs
 */
export const ClientStatus = {
    ACTIVE: 1,
    INACTIVE: 2,
    SUSPENDED: 3
};
/** Duration in milliseconds for toast notifications */
export const TOAST_DURATION_MS = 5000;
/** Default pagination settings */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
};
/** Time calculation constants (in seconds) */
export const TIME_INTERVALS = {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    MONTH: 2592000,
    YEAR: 31536000,
};
/** Animation durations (in milliseconds) */
export const ANIMATION = {
    DEBOUNCE_MS: 300,
    TRANSITION_MS: 200,
};
/** File upload limits */
export const FILE_LIMITS = {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
};
/** Credibility score thresholds */
export const CREDIBILITY = {
    LOW_THRESHOLD: 30,
    MEDIUM_THRESHOLD: 60,
    HIGH_THRESHOLD: 80,
};
/** Chart default colors */
export const CHART_COLORS = [
    '#6366F1', // Primary indigo
    '#22C55E', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
];
