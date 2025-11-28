// Converts UTC date to Brazil time (UTC-3)
export function toBrazilTime(date: Date): string {
    const brazilDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    return brazilDate.toISOString().replace('T', ' ').substring(0, 19);
}
