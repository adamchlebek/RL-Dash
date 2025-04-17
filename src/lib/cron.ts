import axios from 'axios';

interface PollingResult {
    status: 'completed' | 'processing' | 'failed';
    id: string;
    ballchasingId: string;
}

export const setupReplayPolling = (): ReturnType<typeof setInterval> => {
    // Poll every 15 seconds
    return setInterval(async () => {
        try {
            try {
                const response = await axios.get('/api/cron/poll-replays');

                // Log success with details if we have results
                if (response.data.results && response.data.results.length > 0) {
                    console.log(`Replay polling: ${response.data.processed || 0} replays checked`);

                    // Log any state changes
                    const completed = response.data.results.filter(
                        (r: PollingResult) => r.status === 'completed'
                    ).length;
                    const failed = response.data.results.filter(
                        (r: PollingResult) => r.status === 'failed'
                    ).length;

                    if (completed > 0 || failed > 0) {
                        console.log(`Status changes: ${completed} completed, ${failed} failed`);
                    }
                } else if (response.data.message === 'No processing replays found') {
                    // No replays to process
                    console.log('No processing replays found');
                } else {
                    console.log('Replay polling completed');
                }
            } catch (error) {
                // Handle API errors more gracefully with less console spam
                if (axios.isAxiosError(error) && error.response) {
                    console.error(
                        `Replay polling error: ${error.response.status} - ${error.response.data?.error || 'Unknown'}`
                    );
                } else {
                    console.error('Error polling for replays');
                }
            }
        } catch (error) {
            // Catch any other unexpected errors
            console.error('Unexpected error in replay polling', error);
        }
    }, 15000);
};

export const stopReplayPolling = (intervalId: ReturnType<typeof setInterval>): void => {
    clearInterval(intervalId);
};

export const validateCronSecret = (request: Request): boolean => {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    const validSecret = process.env.CRON_SECRET;

    if (!validSecret) {
        console.warn('CRON_SECRET is not set');
        return false;
    }

    return secret === validSecret;
};
