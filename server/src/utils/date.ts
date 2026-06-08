export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function subMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() - months, date.getDate());
}
