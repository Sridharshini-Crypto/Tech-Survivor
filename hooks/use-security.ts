'use client';

import { useEffect, useCallback, useRef } from 'react';

interface SecurityOptions {
  enableFullscreen: boolean;
  enableTabSwitchDetection: boolean;
  enableMultiTabDetection: boolean;
  onViolation: (type: string, description: string) => void;
}

export function useSecurityMonitor({
  enableFullscreen,
  enableTabSwitchDetection,
  enableMultiTabDetection,
  onViolation,
}: SecurityOptions) {
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const enterFullscreen = useCallback(async () => {
    if (!enableFullscreen) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // may fail silently
    }
  }, [enableFullscreen]);

  useEffect(() => {
    if (!enableFullscreen) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onViolationRef.current('fullscreen_exit', 'User exited fullscreen mode');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enableFullscreen]);

  useEffect(() => {
    if (!enableTabSwitchDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolationRef.current('tab_switch', 'User switched tabs or minimized browser');
      }
    };
    const handleBlur = () => {
      onViolationRef.current('focus_loss', 'Window lost focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enableTabSwitchDetection]);

  useEffect(() => {
    if (!enableMultiTabDetection) return;

    const channelKey = 'ts-multi-tab-check';
    const tabId = Math.random().toString(36).slice(2);

    const bc = new BroadcastChannel(channelKey);
    bc.postMessage({ type: 'tab-open', tabId });

    bc.onmessage = (event) => {
      if (event.data.type === 'tab-open' && event.data.tabId !== tabId) {
        onViolationRef.current('multi_tab', 'Multiple competition tabs detected');
      }
    };

    return () => bc.close();
  }, [enableMultiTabDetection]);

  return { enterFullscreen };
}
