import axios from 'axios';

export const setupReplayPolling = (): ReturnType<typeof setInterval> => {
  // Poll every 15 seconds
  return setInterval(async () => {
    try {
      // In browser, just call the API endpoint directly
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      try {
        const response = await axios.get(`${baseUrl}/api/cron/poll-replays`);
        
        // Log success with details if we have results
        if (response.data.results && response.data.results.length > 0) {
          console.log(`Replay polling: ${response.data.processed || 0} replays checked`);
          
          // Log any state changes
          const completed = response.data.results.filter((r: any) => r.status === 'completed').length;
          const failed = response.data.results.filter((r: any) => r.status === 'failed').length;
          
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
          console.error(`Replay polling error: ${error.response.status} - ${error.response.data?.error || 'Unknown'}`);
        } else {
          console.error('Error polling for replays');
        }
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error('Unexpected error in replay polling');
    }
  }, 15000);
};

export const stopReplayPolling = (intervalId: ReturnType<typeof setInterval>): void => {
  clearInterval(intervalId);
}; 