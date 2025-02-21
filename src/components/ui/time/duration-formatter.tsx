type DurationFormatterProps = {
  duration: number;
  base: "milliseconds" | "seconds" | "minutes" | "hours";
  className?: string;
};

function DurationFormatter({ duration, base = "seconds", className }: DurationFormatterProps) {
  let durationAsMs: number = duration;
  const dayAsMs = 86400000;
  const hourAsMs = 3600000;
  const minuteAsMs = 60000;
  const secondAsMs = 1000;

  switch (base) {
    case "milliseconds":
      durationAsMs = duration;
      break;
    case "seconds":
      durationAsMs = duration * secondAsMs;
      break;
    case "minutes":
      durationAsMs = duration * minuteAsMs;
      break;
    case "hours":
      durationAsMs = duration * hourAsMs;
      break;
  }

  const days = Math.floor(durationAsMs / dayAsMs);
  const hours = Math.floor((durationAsMs % dayAsMs) / hourAsMs);
  const minutes = Math.floor((durationAsMs % hourAsMs) / minuteAsMs);
  const seconds = Math.floor((durationAsMs % minuteAsMs) / secondAsMs);
  const milliseconds = Math.floor((durationAsMs % secondAsMs) / 100);

  let formattedString = "";
  let detailedTooltip = "";

  if (days > 0) {
    formattedString = `${days} d. ${hours} h.`;
    detailedTooltip = `${days} d. ${hours} h. ${minutes} min. ${seconds} sec.`;
  } else if (hours > 0) {
    formattedString = `${hours} h. ${minutes} min.`;
    detailedTooltip = `${hours} h. ${minutes} min. ${seconds} sec.`;
  } else if (minutes > 0) {
    formattedString = `${minutes} min. ${seconds} sec.`;
    detailedTooltip = `${minutes} min. ${seconds} sec. ${milliseconds} ms.`;
  } else {
    formattedString = `${seconds} sec.`;
    detailedTooltip = `${seconds} sec. ${milliseconds} ms.`;
  }

  return (
    <span className={className} title={detailedTooltip}>
      {formattedString}
    </span>
  );
}

export default DurationFormatter;
