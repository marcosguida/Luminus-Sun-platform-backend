import { ICreateWeather } from "@/modules/weather/weather.model";
import { estimateGHI } from "@/lib/estimateGHI";
import { regionStationRepository } from "@/modules/region/regionStation.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toBrazilianTime } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export const mapCurrentWeatherToModel = async (
    data: any,
    regionId?: string
): Promise<ICreateWeather> => {
    const main = data.main ?? {};
    const wind = data.wind ?? {};
    const weather = data.weather?.[0] ?? {};
    const clouds = data.clouds?.all ?? 0;
    const rain = data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0;

    const regionStation = await regionStationRepository.Query.findRegionStationById(regionId || "");

    const timestamp = toBrazilianTime(new Date(data.dt * 1000));

    return {
        regionId,
        temperature: main.temp ?? 0,
        feelsLike: main.feels_like,
        minTemp: main.temp_min,
        maxTemp: main.temp_max,
        humidity: main.humidity ?? 0,
        pressure: main.pressure,
        windSpeed: wind.speed,
        windDeg: wind.deg,
        clouds,
        visibility: data.visibility,
        rainVolume: rain,
        solarIrradiance: estimateGHI({
            lat: regionStation?.latitude ?? 0,
            lon: regionStation?.longitude ?? 0,
            date: timestamp,
            clouds,
            altitudeM: regionStation?.altitude ?? 0,
        }),
        description: weather.description ?? "Sem descrição",
        source: "OpenWeather",
        timestamp: timestamp,
    };
};


export const mapForecastWeatherToModel = async (
    forecastData: any,
    regionId?: string
): Promise<ICreateWeather[]> => {
    if (!forecastData.list || !Array.isArray(forecastData.list)) return [];

    const regionStation = await regionStationRepository.Query.findRegionStationById(regionId || "");

    return Promise.all(forecastData.list.map(async (item: any) => {
        const main = item.main ?? {};
        const wind = item.wind ?? {};
        const weather = item.weather?.[0] ?? {};
        const clouds = item.clouds?.all ?? 0;
        const rain = item.rain?.["3h"] ?? 0;

        const timestamp = toBrazilianTime(new Date(item.dt * 1000))

        return {
            regionId,
            temperature: main.temp || 0,
            feelsLike: main.feels_like,
            minTemp: main.temp_min,
            maxTemp: main.temp_max,
            humidity: main.humidity || 0,
            pressure: main.pressure,
            windSpeed: wind.speed,
            windDeg: wind.deg,
            clouds,
            rainVolume: rain,
            solarIrradiance: estimateGHI({
                lat: regionStation?.latitude || 0,
                lon: regionStation?.longitude || 0,
                date: timestamp,
                clouds,
                altitudeM: regionStation?.altitude || 0,
            }),
            description: weather.description ?? "Sem descrição",
            source: "OpenWeather",
            timestamp: timestamp,
        };
    }));
};
