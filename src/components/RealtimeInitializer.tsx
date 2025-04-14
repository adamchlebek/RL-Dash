'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function RealtimeInitializer(): null {
  useEffect(() => {
    // Initialize realtime subscriptions
    const initRealtime = async (): Promise<void> => {
      try {
        // Create a Supabase channel for the Replay table
        const channel = supabase.channel('schema-db-changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'Replay'
          }, (payload) => {
            console.log('Supabase realtime subscription working:', payload.eventType);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to Replay table changes');
            }
          });
        
        // Test the API connection
        await fetch('/api/supabase/realtime', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error initializing realtime:', error);
      }
    };

    initRealtime();
    
    // Cleanup on unmount
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  // This component doesn't render anything
  return null;
} 