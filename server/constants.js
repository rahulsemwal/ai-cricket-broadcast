/**
 * Backend constants and external API URLs.
 */
export const CRIC_API_BASE_URL = "https://api.cricapi.com/v1/cricScore";

/**
 * Enum for supported Cricket API sources.
 */
export const CRICKET_API_SOURCES = {
    CRIC_API: "cricAPI",
    CRIC_HUT: "cricHut",
    RAPID_API: "rapidAPI"
};

export const DEFAULT_CRICKET_API_SOURCE = CRICKET_API_SOURCES.CRIC_API;