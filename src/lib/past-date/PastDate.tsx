import { DateTime, Interval } from "luxon";
import humanizeDuration from "humanize-duration";
import { useMemo, useState, useEffect } from "react";

const englishTimeHumanizer = humanizeDuration.humanizer({
  delimiter: " ",
  language: "shortEn",
  languages: {
    shortEn: {
      m: () => "min",
      s: () => "sec",
    },
  },
});

const UPDATE_INTERVAL = 15_000;

export default function PastDate({ value }: { value: string }) {
  const [now, setNow] = useState<DateTime>(DateTime.now());

  const dateValue = useMemo(() => DateTime.fromISO(value), [value]);
  const duration = Interval.fromDateTimes(dateValue, now).toDuration().toMillis();

  const isWithinMinute = duration < 60_000;
  const isWithinHour = duration < 60_000 * 60;

  const formattedValue = () => {
    if (!dateValue.isValid) {
      return { mainPart: "N/A", suffixPart: "" };
    }
    if (isWithinMinute || isWithinHour) {
      return {
        mainPart: englishTimeHumanizer(duration, { round: true, largest: 1 }),
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
      }, UPDATE_INTERVAL);
    }

    return () => {
      clearInterval(timeUpdateInterval);
    };
  }, [isWithinHour]);

  return <span>{`${formattedValue().mainPart} ${formattedValue().suffixPart}`}</span>;
}
