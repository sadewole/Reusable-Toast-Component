import React from 'react';

export const useTimer = ({
  autoDismiss,
  onDismiss,
}: {
  autoDismiss: number;
  onDismiss?(): void;
}) => {
  const timer = React.useRef<any>();
  const clearTimer = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, []);
  const setTimer = () => {
    if (autoDismiss && onDismiss) {
      timer.current = setTimeout(onDismiss, autoDismiss);
    }
  };
  return {
    clearTimer,
    setTimer,
  };
};
