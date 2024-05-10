import { DateTime, Interval } from "luxon";
import humanizeDuration from "humanize-duration";
import { useMemo, useState, useEffect } from "react";

const englishTimeHumanizer = humanizeDuration.humanizer({
  delimiter: " ",
  language: "shortEn",
  languages: {
    shortEn: {
      h: () => "h",
      m: () => "min",
      s: () => "sec",
    },
  },
});

export default function PastDate({
  value,
  updateInterval = 15_000,
}: {
  value: string;
  updateInterval?: number;
}) {
  const [now, setNow] = useState<DateTime>(DateTime.now());

  const dateValue = useMemo(() => DateTime.fromISO(value), [value]);
  const duration = Interval.fromDateTimes(dateValue, now).toDuration().toMillis();

  const isWithinMinute = duration < 60_000;
  const isWithinHour = duration < 60_000 * 60;
  const isWithin24hrs = duration < 60_000 * 60 * 24;

  const formattedValue = () => {
    if (!dateValue.isValid) {
      return { mainPart: "N/A", suffixPart: "" };
    }
    if (isWithinMinute || isWithinHour || isWithin24hrs) {
      return {
        mainPart: englishTimeHumanizer(duration, { round: true, largest: 2 }),
        suffixPart: "ago",
      };
    }
    return {
      mainPart: dateValue.toFormat("d LLL yyyy"),
      suffixPart: dateValue.toFormat("HH:mm"),
    };
  };

  useEffect(() => {
    let timeUpdateInterval: ReturnType<typeof setInterval>;

    if (isWithinHour) {
      timeUpdateInterval = setInterval(() => {
        setNow(DateTime.now());
      }, updateInterval);
    }

    if (isWithin24hrs && !isWithinHour) {
      timeUpdateInterval = setInterval(() => {
        setNow(DateTime.now());
      }, updateInterval * 2);
    }

    return () => {
      clearInterval(timeUpdateInterval);
    };
  }, [updateInterval, isWithinHour, isWithin24hrs]);

  return <span>{`${formattedValue().mainPart} ${formattedValue().suffixPart}`}</span>;
}
