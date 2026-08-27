export default async function handler(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      message: "weather-hourly API is working",
      time: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
