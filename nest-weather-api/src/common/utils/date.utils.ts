// Converts UTC date to Brazil time (UTC-3)
export function toBrazilTime(date: Date): string {
    const brazilDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    return brazilDate.toISOString().replace('T', ' ').substring(0, 19);
}

// Converts Brazil time (BRT without timezone) to UTC for database queries
export function fromBrazilTimeToUTC(dateString: string): Date {
    // If already has 'Z', it's already in ISO format from frontend
    if (dateString.endsWith('Z')) {
        const date = new Date(dateString);
        return date;
    }
    
    // If no 'Z', add it and add 3 hours for BRT -> UTC conversion
    const date = new Date(dateString + 'Z');
    const utcDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return utcDate;
}