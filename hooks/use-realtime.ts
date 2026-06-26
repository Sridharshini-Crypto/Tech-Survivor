'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  table: string,
  callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void,
  filter?: string
) {
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const pgFilter: {
      event: '*';
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: '*',
      schema: 'public',
      table,
    };
    if (filter) {
      pgFilter.filter = filter;
    }

    channel = supabase
      .channel(`realtime-${table}-${filter || 'all'}`)
      .on('postgres_changes', pgFilter, (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
        callback({
          eventType: payload.eventType,
          new: payload.new || {},
          old: payload.old || {},
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, callback]);
}

export function useRealtimeBroadcast(
  channelName: string,
  event: string,
  callback: (payload: Record<string, unknown>) => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, (payload) => {
        callback(payload.payload as Record<string, unknown>);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, event, callback]);
}
