/**
 * Product slug groups to maintain consistency between pages
 * and handle backend slug variations (slug regeneration).
 */

export const KIT_SLUGS = [
    'the-refill-kit-satin-only',
    'the-essentials-kit',
    'the-all-in-one-kit'
];

export const SERVICE_SLUGS = [
    'mail-in-service',
    'standard-mail-in-service',
    'concierge',
    'concierge-service'
];

export const HOME_FEATURED_SLUGS = [
    'the-refill-kit-satin-only',
    ...SERVICE_SLUGS
];
