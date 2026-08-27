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
      `&format=JSON&StationId=${STATION_ID}`;

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`CWA HTTP ${response.status}`);
    }

    const data = await response.json();

    const stations =
      data?.records?.Station ||
      data?.records?.station ||
      [];

    const station = stations.find(
      s =>
        String(
          s.StationId ||
          s.StationID ||
          s.stationId ||
          ""
        ).toUpperCase() === STATION_ID
    );

    if (!station) {
      throw new Error("Shengang station C0F9I0 not found");
    }

    return res.status(200).json({
      ok: true,
      stationId: STATION_ID,
      stationName: station.StationName || "神岡",
      observedAt:
        station?.ObsTime?.DateTime ||
        new Date().toISOString(),
      data: station
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
}
