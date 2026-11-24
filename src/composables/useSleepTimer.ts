export const SLEEP_OPTIONS_MIN = [0, 15, 30, 45, 60];

// Counts down to a wall-clock deadline (not a tick count), so a throttled
// background tab still stops on time.
export const useSleepTimer = (onExpire: () => void) => {
  const minutes = ref(0);
  const remaining = ref(0); // seconds
  let endAt = 0;

  const { pause, resume } = useIntervalFn(
    () => {
      remaining.value = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (remaining.value === 0) {
        set(0);
        onExpire();
      }
    },
    1000,
    { immediate: false },
  );

  function set(value: number) {
    minutes.value = value;
    remaining.value = value * 60;
    endAt = Date.now() + value * 60_000;
    if (value) resume();
    else pause();
  }

  const cycle = () => {
    const i = SLEEP_OPTIONS_MIN.indexOf(minutes.value);
    set(SLEEP_OPTIONS_MIN[(i + 1) % SLEEP_OPTIONS_MIN.length]!);
  };

  return { minutes, remaining, cycle, cancel: () => set(0) };
};
