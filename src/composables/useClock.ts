export const useClock = () => {
  const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 1000) });

  const greeting = computed(() => {
    const hour = now.value.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const isEvening = computed(() => now.value.getHours() >= 18);
  const greetingIcon = computed(() =>
    isEvening.value ? "moon-icon" : "sun-icon",
  );

  const time = useDateFormat(now, "hh:mm:ss A");
  const date = useDateFormat(now, "dddd, MMMM D, YYYY");

  return { greeting, greetingIcon, isEvening, time, date };
};
