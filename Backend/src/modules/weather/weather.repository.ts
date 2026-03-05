import { DatabaseError } from "@/lib/errors/DatabaseError";
import { ICreateWeather, IUpdateWeather, WeatherModel } from "./weather.model";
import { toPlainObject } from "@/lib/utils";
import { WeatherResponse } from "./weather.dto";

const Query = {
    findWeatherById: async (weatherId: string): Promise<WeatherResponse | null> => {
        try {
            const weather = await WeatherModel.findById(weatherId);
            return weather ? toPlainObject<WeatherResponse>(weather) : null;
        } catch {
            throw new DatabaseError("Erro ao buscar dados climáticos por ID.");
        }
    },

    findWeatherByRegionId: async (regionId: string): Promise<WeatherResponse[]> => {
        try {
            const weathers = await WeatherModel.find({ regionId }).sort({ timestamp: -1 });
            return weathers.map(w => toPlainObject<WeatherResponse>(w));
        } catch {
            throw new DatabaseError("Erro ao buscar dados climáticos por região.");
        }
    },

    findNextWeathersByToday: async (regionId: string): Promise<WeatherResponse[]> => {
        try {
            const now = new Date();
            const fiveDaysAhead = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

            const weathers = await WeatherModel.find({
                regionId,
                timestamp: { $gte: now, $lt: fiveDaysAhead },
            }).sort({ timestamp: 1 });

            return weathers.map(w => toPlainObject<WeatherResponse>(w));
        } catch (error) {
            throw error;
        }
    },

    findAllWeather: async (): Promise<WeatherResponse[]> => {
        try {
            const weathers = await WeatherModel.find().sort({ timestamp: -1 });
            return weathers.map(w => toPlainObject<WeatherResponse>(w));
        } catch {
            throw new DatabaseError("Erro ao buscar todos os registros climáticos.");
        }
    },
    existsWeatherForRegionAndTime: async (regionId: string, timestamp: Date): Promise<boolean> => {
        const existing = await WeatherModel.exists({
            regionId,
            timestamp,
            source: "OpenWeather",
        });

        return !!existing;
    },
};

const Mutation = {
    createWeather: async (weatherData: ICreateWeather): Promise<WeatherResponse> => {
        try {
            const newWeather = await WeatherModel.create(weatherData);
            return toPlainObject<WeatherResponse>(newWeather);
        } catch {
            throw new DatabaseError("Erro ao criar registro climático.");
        }
    },

    updateWeather: async ({
        weatherId,
        weatherData,
    }: {
        weatherId: string;
        weatherData: IUpdateWeather;
    }): Promise<WeatherResponse | null> => {
        try {
            const updated = await WeatherModel.findByIdAndUpdate(
                weatherId,
                { $set: { ...weatherData, updatedAt: new Date() } },
                { new: true }
            );
            return updated ? toPlainObject<WeatherResponse>(updated) : null;
        } catch {
            throw new DatabaseError("Erro ao atualizar registro climático.");
        }
    },

    deleteWeather: async (weatherId: string): Promise<boolean> => {
        try {
            const deleted = await WeatherModel.findByIdAndDelete(weatherId);
            return !!deleted;
        } catch {
            throw new DatabaseError("Erro ao deletar registro climático.");
        }
    },

    bulkInsert: async (weathers: ICreateWeather[]): Promise<void> => {
        try {
            await WeatherModel.insertMany(weathers, { ordered: false });
        } catch {
            throw new DatabaseError("Erro ao inserir registros climáticos em massa.");
        }
    },
    bulkUpsert: async (weathers: ICreateWeather[]): Promise<void> => {
        if (weathers.length === 0) return;

        try {
            const operations = weathers.map((entry) => ({
                updateOne: {
                    filter: {
                        regionId: entry.regionId,
                        timestamp: entry.timestamp
                    },

                    update: { $set: entry },

                    upsert: true
                }
            }));

            await WeatherModel.bulkWrite(operations, { ordered: false });

        } catch (error) {
            console.error("Erro no bulkUpsert de clima:", error);
            throw new DatabaseError("Erro ao atualizar registros climáticos em massa.");
        }
    },
};

export const weatherRepository = {
    Query,
    Mutation,
};
