/**
 * Centralized configuration for user packages/plans.
 * This defines hardcoded limits and features for different subscription levels.
 */

export const PLAN_IDS = {
    FREE: 'free',
    CREATOR: 'creator',
    PRO: 'pro',
    AGENCY: 'agency'
};

export const PACKAGE_CONFIGS = {
    [PLAN_IDS.FREE]: {
        name: "Free",
        monthlyPosts: 30,
        viewFailedPost: false,
        failedPostRecovery: false,
        socialAccounts: 3,
        teamMembers: 1,
        advancedAnalytics: false,
        aiCaptions: 0,
        support: "Basic"
    },
    [PLAN_IDS.CREATOR]: {
        name: "Creator",
        monthlyPosts: 100,
        viewFailedPost: true,
        failedPostRecovery: true,
        socialAccounts: 10,
        teamMembers: 1,
        advancedAnalytics: true,
        aiCaptions: 50,
        support: "Priority"
    },
    [PLAN_IDS.PRO]: {
        name: "Pro",
        monthlyPosts: 300,
        viewFailedPost: true,
        failedPostRecovery: true,
        socialAccounts: 25,
        teamMembers: 3,
        advancedAnalytics: true,
        aiCaptions: -1, // Unlimited
        support: "Priority"
    },
    [PLAN_IDS.AGENCY]: {
        name: "Agency",
        monthlyPosts: 1000,
        viewFailedPost: true,
        failedPostRecovery: true,
        socialAccounts: 50,
        teamMembers: 10,
        advancedAnalytics: true,
        aiCaptions: -1, // Unlimited
        support: "SLA Support"
    }
};

/**
 * Returns the configuration for a given plan ID.
 * Defaults to 'free' plan if no planId or invalid planId is provided.
 * 
 * @param {string} planId - The ID of the plan (e.g., 'free', 'pro')
 * @returns {Object} The plan configuration object
 */
export function getPackageConfig(planId) {
    const normalizedId = (planId || PLAN_IDS.FREE).toLowerCase();

    // Check if the planId exists, if not fallback to free
    if (PACKAGE_CONFIGS[normalizedId]) {
        return {
            id: normalizedId,
            ...PACKAGE_CONFIGS[normalizedId]
        };
    }

    // Fallback logic for legacy or variation IDs
    if (normalizedId.includes('pro')) return { id: PLAN_IDS.PRO, ...PACKAGE_CONFIGS[PLAN_IDS.PRO] };
    if (normalizedId.includes('creator')) return { id: PLAN_IDS.CREATOR, ...PACKAGE_CONFIGS[PLAN_IDS.CREATOR] };
    if (normalizedId.includes('agency')) return { id: PLAN_IDS.AGENCY, ...PACKAGE_CONFIGS[PLAN_IDS.AGENCY] };

    return {
        id: PLAN_IDS.FREE,
        ...PACKAGE_CONFIGS[PLAN_IDS.FREE]
    };
}
