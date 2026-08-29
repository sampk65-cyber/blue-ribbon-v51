const CWA_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001";
const STATION_ID = "C0F9I0";
const FIREBASE_API_KEY = "AIzaSyDJXF_9jyibl5GsbJHEuPVBIOqQ2Eovjw4";
const FIREBASE_PROJECT_ID = "figapi-d24dc";

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > -90 ? n : null;
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
  }
  return null;
}

function hourKey(dateValue) {
  const date = new Date(dateValue || Date.now());
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false
  }).formatToParts(date);

  const get = (type) =>
    (parts.find((p) => p.type === type) || {}).value || "";

  let hour = get("hour");
  if (hour === "24") hour = "00";

  return `${get("year")}-${get("month")}-${get("day")}T${hour}`;
}

async function firebaseAnonymousLogin() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true })
    }
  );

  if (!response.ok) {
    throw new Error(`Firebase anonymous auth HTTP ${response.status}`);
  }

  return response.json();
}

async function saveToFirebase(key, record, auth) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/kv/${encodeURIComponent(key)}`;

  const payload = {
    fields: {
      key: { stringValue: key },
      value: { stringValue: JSON.stringify(record) },
      updatedAt: { integerValue: String(Date.now()) },
      updatedByUid: {
        stringValue: auth.localId || "weather-hourly"
      }
    }
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.idToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Firestore HTTP ${response.status}: ${text}`
    );
  }
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.CWA_API_KEY;

    if (!apiKey) {
      throw new Error("CWA_API_KEY not configured");
    }

    const response = await fetch(
      `${CWA_URL}?Authorization=${encodeURIComponent(apiKey)}&format=JSON&StationId=${STATION_ID}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`CWA HTTP ${response.status}`);
    }

    const json = await response.json();

    let stations =
      json?.records?.Station ||
      json?.records?.station ||
      json?.records?.location ||
      [];

    if (!Array.isArray(stations)) {
      stations = stations ? [stations] : [];
    }

    const station =
      stations.find(
        (item) =>
          String(
            item?.StationId ||
            item?.StationID ||
            item?.stationId ||
            ""
          ).toUpperCase() === STATION_ID
      ) ||
      (stations.length === 1 ? stations[0] : null);

    if (!station) {
      throw new Error("Shengang station C0F9I0 not found");
    }

    const weather =
      station.WeatherElement ||
      station.weatherElement ||
      {};

    const geo =
      station.GeoInfo ||
      station.geoInfo ||
      {};

    const observedAt =
      station?.ObsTime?.DateTime ||
      station?.obsTime?.DateTime ||
      station?.DateTime ||
      new Date().
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
