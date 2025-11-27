export const WEATHER_CONSTANTS = {
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    HUMIDITY: {
        MIN: 0,
        MAX: 100,
    },
    FILTERS: {
        INITIAL_STATE: {
            startDate: '',
            endDate: '',
            minTemp: undefined,
            maxTemp: undefined,
            minHumidity: undefined,
            maxHumidity: undefined,
        },
    },
} as const;
