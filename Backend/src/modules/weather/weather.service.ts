import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors/AppError";
import { weatherRepository } from "./weather.repository";
import {
    CreateWeatherRequest,
    UpdateWeatherRequest,
    WeatherResponse,
} from "./weather.dto";
import { OpenWeatherService } from "@/services/openWeather/openWeather.service";
import { userRepository } from "../user/user.repository";
import { mapForecastWeatherToModel } from "@/services/openWeather/openWeather.mapper";

const Query = {
    findWeatherById: async (weatherId: string): Promise<WeatherResponse | null> => {
        if (!weatherId) throw new BadRequestError("ID do registro climático é obrigatório.");

        const weather = await weatherRepository.Query.findWeatherById(weatherId);
        if (!weather) throw new NotFoundError("Registro climático não encontrado.");

        return weather;
    },

    findAllWeather: async (): Promise<WeatherResponse[]> => {
        return await weatherRepository.Query.findAllWeather();
    },

    findWeatherByRegionId: async (regionId: string): Promise<WeatherResponse[]> => {
        if (!regionId) throw new BadRequestError("O ID da região é obrigatório.");

        const weathers = await weatherRepository.Query.findWeatherByRegionId(regionId);
        if (!weathers || weathers.length === 0)
            throw new NotFoundError("Nenhum registro climático encontrado para esta região.");

        return weathers;
    },
};

const Mutation = {
    createWeather: async (data: CreateWeatherRequest): Promise<WeatherResponse> => {
        const { temperature, humidity } = data;

        if (temperature === undefined || humidity === undefined)
            throw new BadRequestError("Temperatura e umidade são obrigatórias.");

        const created = await weatherRepository.Mutation.createWeather(data);
        return created;
    },

    updateWeather: async (
        weatherId: string,
        weatherData: UpdateWeatherRequest
    ): Promise<WeatherResponse> => {
        if (!weatherId) throw new BadRequestError("ID do registro climático é obrigatório.");

        const existing = await weatherRepository.Query.findWeatherById(weatherId);
        if (!existing) throw new NotFoundError("Registro climático não encontrado.");

        const updated = await weatherRepository.Mutation.updateWeather({ weatherId, weatherData });
        if (!updated) throw new BadRequestError("Falha ao atualizar o registro climático.");

        return updated;
    },

    deleteWeather: async (weatherId: string): Promise<{ message: string }> => {
        if (!weatherId) throw new BadRequestError("ID do registro climático é obrigatório.");

        const existing = await weatherRepository.Query.findWeatherById(weatherId);
        if (!existing) throw new NotFoundError("Registro climático não encontrado.");

        const deleted = await weatherRepository.Mutation.deleteWeather(weatherId);
        if (!deleted) throw new BadRequestError("Falha ao deletar o registro climático.");

        return { message: "Registro climático deletado com sucesso." };
    },

    bulkInsert: async (weathers: CreateWeatherRequest[]): Promise<{ message: string }> => {
        if (!weathers?.length)
            throw new BadRequestError("Nenhum dado climático fornecido para inserção em massa.");

        await weatherRepository.Mutation.bulkInsert(weathers);
        return { message: "Registros climáticos inseridos com sucesso." };
    },
    updateWeatherForAllUserRegions: async (): Promise<{ updated: number; inserted: number }> => {
        try {
            const usersWithRegions = await userRepository.Query.findUsersWithRegion();
            if (usersWithRegions.length === 0) {
                console.log("⚠️ Nenhum usuário com região associada encontrado.");
                return { updated: 0, inserted: 0 };
            }

            const processedRegions = new Set<string>();
            let updatedCount = 0;
            let insertedCount = 0;

            for (const user of usersWithRegions) {
                const region = user.regionId;
                if (!region || !region.latitude || !region.longitude) continue;

                if (processedRegions.has(region._id.toString())) continue;
                processedRegions.add(region._id.toString());

                try {
                    const weatherData = await OpenWeatherService.getForecastHourly5Days({
                        lat: region.latitude,
                        lon: region.longitude,
                    });

                    const mappedWeather = await mapForecastWeatherToModel(weatherData, region._id.toString());

                    const newWeathers = [];
                    for (const weather of mappedWeather) {
                        const exists = await weatherRepository.Query.existsWeatherForRegionAndTime(
                            region._id.toString(),
                            (weather.timestamp as Date)
                        );
                        if (!exists) newWeathers.push(weather);
                    }

                    if (newWeathers.length > 0) {
                        await weatherRepository.Mutation.bulkInsert(newWeathers);
                        insertedCount += newWeathers.length;
                        updatedCount++;
                    }

                    console.log(
                        `✅ Clima atualizado para ${region.name} (${region.uf}) — ${newWeathers.length} novos registros [${user.email}]`
                    );
                } catch (err: any) {
                    console.error(`⚠️ Erro ao atualizar clima para ${region.name}:`, err.message);
                }
            }

            console.log(
                `✅ Atualização climática concluída (${updatedCount} regiões processadas, ${insertedCount} novos registros).`
            );

            return { updated: updatedCount, inserted: insertedCount };
        } catch (error) {
            throw new ConflictError("Erro ao atualizar clima para todas as regiões do usuário.");
        }
    },

};

export const weatherService = {
    Query,
    Mutation,
};
