const DEADLINE_TIME_ZONE = "America/Sao_Paulo";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DEADLINE_TIME_ZONE,
  calendar: "iso8601",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function approvedCivilDay(approvedAt: string): string {
  const parts = dayFormatter.formatToParts(new Date(approvedAt));
  const part = (type: Intl.DateTimeFormatPartTypes): string => {
    const value = parts.find((p) => p.type === type)?.value;
    if (value === undefined) throw new Error(`parte ${type} ausente em ${approvedAt}`);
    return value;
  };
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isPastDeadline(approvedAt: string, deadlineDate: string): boolean {
  return approvedCivilDay(approvedAt) > deadlineDate;
}
