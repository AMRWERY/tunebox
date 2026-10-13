export const useClock = () => {
  const now = useNow({ interval: 1000 });

  const greeting = computed(() => {
    const hour = now.value.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const time = useDateFormat(now, "hh:mm:ss A");
  const date = useDateFormat(now, "dddd, MMMM D, YYYY");

  return { greeting, time, date };
};
