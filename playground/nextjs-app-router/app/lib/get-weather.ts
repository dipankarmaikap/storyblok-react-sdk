export default async function getWeather(location: string) {
  const coords = LOCATIONS[location as LocationKey];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,wind_speed_10m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API returned ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    fetchedAt: new Date().toISOString(),
  };
}

const LOCATIONS = {
  kolkata: {
    label: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: "Asia/Kolkata",
  },
  london: {
    label: "London",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London",
  },
  new_york: {
    label: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  },
  paris: {
    label: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris",
  },
} as const;

export type LocationKey = keyof typeof LOCATIONS;
