'use client';

import { useEffect, useState } from 'react';
import { getEdgeConfig, setEdgeConfig } from '@/lib/edgeConfig';
import { toast } from 'sonner';

export function PollingInterval() {
    const [interval, setInterval] = useState<number>(30);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [debouncedValue, setDebouncedValue] = useState<number>(30);

    useEffect(() => {
        fetchInterval();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(interval);
        }, 2000);

        return () => clearTimeout(timer);
    }, [interval]);

    useEffect(() => {
        if (debouncedValue === interval) {
            handleIntervalChange(debouncedValue);
        }
    }, [debouncedValue]);

    const fetchInterval = async () => {
        try {
            const data = await getEdgeConfig<number>('polling_interval');
            setInterval(data?.value ?? 30);
        } catch (error) {
            console.error('Error fetching interval:', error);
            toast.error('Failed to load interval setting');
        } finally {
            setIsLoading(false);
        }
    };

    const handleIntervalChange = async (newValue: number) => {
        if (newValue < 5 || newValue > 1000) {
            toast.error('Interval must be between 5 and 1000 seconds');
            return;
        }

        setIsUpdating(true);
        try {
            await setEdgeConfig('polling_interval', { value: newValue });
            toast.success('Polling interval updated');
        } catch (error) {
            console.error('Error updating interval:', error);
            toast.error('Failed to update interval');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold">Polling Interval</h2>
                <p className="mt-1 text-zinc-400">
                    How often to check for new replay updates (in seconds)
                </p>
            </div>
            <input
                type="text"
                value={interval}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                        setInterval(value);
                    }
                }}
                onBlur={() => handleIntervalChange(interval)}
                disabled={isLoading || isUpdating}
                className="w-24 rounded-md border border-zinc-600 bg-zinc-700/50 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
        </div>
    );
}
