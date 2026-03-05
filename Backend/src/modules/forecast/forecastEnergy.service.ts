import { forecastEnergyRepository } from "./forecastEnergy.repository";
import { WeatherModel } from "@/modules/weather/weather.model";
import { RegionStationModel } from "@/modules/region/regionStation.model";
import { estimateForecastFromWeather } from "@/lib/estimateForecastEnergy";
import { ICreateForecastEnergy } from "./forecastEnergy.model";
import { ForecastEnergyModel } from "./forecastEnergy.model";
import { weatherRepository } from "../weather/weather.repository";

const Query = {
    getAllForecasts: async () => {
        try {
            const forecasts = await forecastEnergyRepository.Query.findAllForecasts();
            return forecasts;
        } catch (error) {
            throw error
        }
    },
    getForecastsByRegion: async (regionId: string) => {
        try {
            return await forecastEnergyRepository.Query.findForecastsByRegion(regionId);
        } catch (error) {
            throw error;
        }
    },
    getForecastByRegionAndDate: async (regionId: string) => {
        const forecasts = await forecastEnergyRepository.Query.findForecastsNext5Days(regionId);
        return forecasts;
    }
};

const Mutation = {
    generateForecastsForAllRegions: async (): Promise<{ count: number }> => {
        const regions = await RegionStationModel.find();
        let createdCount = 0;

        for (const region of regions) {
            const weathers = await weatherRepository.Query.findNextWeathersByToday((region._id as any).toString());

            for (const weather of weathers) {
                const exists = await forecastEnergyRepository.Query.existsForecastForWeatherOrDate(
                    (region._id as any).toString(),
                    (weather._id as any).toString(),
                    weather.timestamp
                );

                if (exists) continue;

                const forecast = estimateForecastFromWeather(weather, {
                    latitude: region.latitude!,
                    longitude: region.longitude!,
                    altitude: region.altitude ?? 0,
                });

                await forecastEnergyRepository.Mutation.createForecast(forecast);
                createdCount++;
            }
        }

        return { count: createdCount };
    },

    generateForecastForRegion: async (regionId: string): Promise<{ count: number }> => {
        const region = await RegionStationModel.findById(regionId);
        if (!region) throw new Error("Região não encontrada.");

        const weathers = await weatherRepository.Query.findNextWeathersByToday(regionId);

        let createdCount = 0;

        for (const weather of weathers) {
            const exists = await forecastEnergyRepository.Query.existsForecastForWeatherOrDate(
                (region._id as any).toString(),
                (weather._id as any).toString(),
                weather.timestamp
            );

            if (exists) continue;

            const forecast = estimateForecastFromWeather(weather, {
                latitude: region.latitude!,
                longitude: region.longitude!,
                altitude: region.altitude ?? 0,
            });

            await forecastEnergyRepository.Mutation.createForecast(forecast);
            createdCount++;
        }

        return { count: createdCount };
    },
};

export const forecastEnergyService = { Query, Mutation };
