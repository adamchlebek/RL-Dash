import { useEffect } from 'react';
import { supabase } from './supabase';

export const useReplaySubscription = (onComplete: () => Promise<void>): void => {
    useEffect(() => {
        // Initialize realtime connection
        const initializeRealtime = async () => {
            try {
                await fetch('/api/supabase/realtime', {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Failed to initialize realtime:', error);
            }
        };

        initializeRealtime();

        // Set up subscription channels
        const completedChannel = supabase
            .channel('replay-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Replay'
                },
                async (payload) => {
                    if (
                        payload.new &&
                        payload.new.status === 'completed' &&
                        payload.old?.status !== 'completed'
                    ) {
                        await onComplete();
                    }
                }
            )
            .subscribe();

        const allChangesChannel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Replay'
                },
                async () => {
                    await onComplete();
                }
            )
            .subscribe();

        return () => {
            completedChannel.unsubscribe();
            allChangesChannel.unsubscribe();
        };
    }, [onComplete]);
};
