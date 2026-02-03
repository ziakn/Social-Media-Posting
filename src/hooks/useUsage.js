// src/hooks/useUsage.js
import { useState, useEffect } from 'react';
import { getUserUsageAction } from '@/app/actions/usage/usageActions';

/**
 * Hook to manage and expose user usage limits and status
 */
export function useUsage() {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsage = async () => {
        try {
            setLoading(true);
            const result = await getUserUsageAction();
            if (result.success) {
                setUsage(result.usage);
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsage();
    }, []);

    const canPost = usage ? (usage.posts.limit === -1 || usage.posts.used < usage.posts.limit) : true;
    const canConnectAccount = usage ? (usage.accounts.limit === -1 || usage.accounts.used < usage.accounts.limit) : true;

    return {
        usage,
        loading,
        error,
        canPost,
        canConnectAccount,
        refreshUsage: fetchUsage
    };
}
