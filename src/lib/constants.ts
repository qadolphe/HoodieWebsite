/**
 * Product IDs to maintain consistency even if slugs or titles change.
 */

export const PRODUCT_IDS = {
    REFILL_KIT: '9b17e3aa-0d23-44da-a317-a33540d142fe',
    ESSENTIALS_KIT: 'e6d01c1b-6923-4f2c-9454-3ccd3ab726ca',
    ALL_IN_ONE_KIT: 'c4f4d01d-eb12-47ae-9234-9e066c70e279',
    MAIL_IN_SERVICE: 'e1b6cad3-78b4-4f3d-9fac-2238b824bd07',
    CONCIERGE_SERVICE: '355c4df3-a584-4ce1-82be-b87da1c3594c',
    MAIL_IN_INSURANCE: '0bc8bb17-4b63-4d2a-a230-5155578d0b17'
}

export const INSURANCE_VARIANT_IDS = {
    BASIC: '4b609bea-e825-4ca3-a311-0a283b4a6b81',
    STANDARD: '072382b0-ca81-4d3d-8a0b-8eda12586b53'
};

export const KIT_IDS = [
    PRODUCT_IDS.REFILL_KIT,
    PRODUCT_IDS.ESSENTIALS_KIT,
    PRODUCT_IDS.ALL_IN_ONE_KIT
];

export const SERVICE_IDS = [
    PRODUCT_IDS.MAIL_IN_SERVICE,
    PRODUCT_IDS.CONCIERGE_SERVICE
];

export const HOME_FEATURED_IDS = [
    PRODUCT_IDS.REFILL_KIT,
    PRODUCT_IDS.MAIL_IN_SERVICE,
    PRODUCT_IDS.CONCIERGE_SERVICE
];

// Slugs are now only used for fallback or URL mapping
export const KIT_SLUGS = [
    'the-refill-kit-satin-only',
    'the-essentials-kit',
    'the-all-in-one-kit'
];
