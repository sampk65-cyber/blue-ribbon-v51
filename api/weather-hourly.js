const CWA_URL =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001";

const STATION_ID = "C0F9I0";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.CWA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "CWA_API_KEY not configured"
      });
    }

    const url =
      `${CWA_URL}?Authorization=${encodeURIComponent(apiKey)}` +
      `&StationId=${encodeURIComponent(STATION_ID)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "CWA request failed",
        detail: data
      });
    }

    const stations =
      data?.records?.Station ||
      data?.records?.station ||
      [];

    const station =
      stations.find((item) =>
        String(
          item?.StationId ||
          item?.StationID ||
          item?.stationId ||
          ""
        ).toUpperCase() === STATION_ID
      ) ||
      (stations.length === 1 ? stations[0] : null);

    if (!station) {
      return res.status(404).json({
        ok: false,
        error: `Station ${STATION_ID} not found`
      });
    }

    const weather =
      station?.WeatherElement ||
      station?.weatherElement ||
      {};

    const observedAt =
      station?.ObsTime?.DateTime ||
      station?.obsTime?.DateTime ||
      station?.DateTime ||
      null;

    const value = (...keys) => {
      for (const key of keys) {
        const v = weather?.[key];

        if (
          v !== undefined &&
          v !== null &&
          v !== ""
        ) {
          return v;
        }
      }

      return null;
    };

    return res.status(200).json({
      ok: true,

      stationId: STATION_ID,

      stationName:
        station?.StationName ||
        station?.stationName ||
        "神岡",

      observedAt,

      weather: {
        temperature:
          value("AirTemperature"),

        humidity:
          value("RelativeHumidity"),

        pressure:
          value("AirPressure"),

        windSpeed:
          value("WindSpeed"),

        windDirection:
          value("WindDirection"),

        gustSpeed:
          value("PeakGustSpeed"),

        precipitation:
          value("Now", "Precipitation"),

        sunshineDuration:
          value("SunshineDuration")
      },

      raw: station
    });

  } catch (error) {

    console.error(
      "weather-hourly error:",
      error
    );

    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        String(error)
    });
  }
}
