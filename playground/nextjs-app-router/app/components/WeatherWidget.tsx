import { SbBlokData, storyblokEditable } from "@storyblok/react";
import getWeather from "../lib/get-weather";

interface WeatherWidgetProps {
  blok: SbBlokData & { title: string; location: string };
}

export async function WeatherWidget({ blok }: WeatherWidgetProps) {
  const weatherData = await getWeather(blok.location);
  return (
    <div className="rounded-lg border p-4" {...storyblokEditable(blok)}>
      <p className="text-sm text-zinc-500">
        {blok.title} of {blok.location}
      </p>
      <p className="mt-1 text-3xl font-medium">{weatherData.temperature}°C</p>
      <p className="mt-1 text-3xl font-medium">{weatherData.windSpeed} km/h</p>
      <span>{weatherData.fetchedAt}</span>
    </div>
  );
}
