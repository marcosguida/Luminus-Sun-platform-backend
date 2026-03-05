import { DatabaseError } from "@/lib/errors/DatabaseError";
import { ForecastEnergyModel, ICreateForecastEnergy, IUpdateForecastEnergy } from "./forecastEnergy.model";
import { toPlainObject } from "@/lib/utils";
import { Types } from "mongoose";
import { ForecastEnergyResponse } from "./forecastEnergy.dto";

const Query = {
    findAllForecasts: async () => {
        try {
            const forecasts = await ForecastEnergyModel.find().sort({ forecastDate: 1 });
            return forecasts.map(toPlainObject);
        } catch (error) {
            throw new DatabaseError("Erro ao buscar todas as previsões energéticas.");
        }
    },
    findForecastsByRegion: async (regionId: string) => {
        try {
            const forecasts = await ForecastEnergyModel.find({ regionId }).sort({ forecastDate: 1 });
            return forecasts.map(toPlainObject);
        } catch {
            throw new DatabaseError("Erro ao buscar previsões energéticas por região.");
        }
    },
    existsForecastForWeatherOrDate: async (
        regionId: string,
        weatherId?: string,
        forecastDate?: Date
    ): Promise<boolean> => {
        try {
            const filter: any = { regionId };

            const orConditions: any[] = [];
            if (weatherId) {
                orConditions.push({ weatherId });
            }
            if (forecastDate) {
                orConditions.push({ regionId, forecastDate });
            }

            if (orConditions.length > 0) {
                filter.$or = orConditions;
            }

            const exists = await ForecastEnergyModel.exists(filter);
            return !!exists;
        } catch (error) {
            throw new DatabaseError("Erro ao verificar duplicidade de previsão energética.");
        }
    },
    findForecastsNext5Days: async (regionId?: string): Promise<ForecastEnergyResponse[]> => {
        try {
            const startOfToday = new Date();
            startOfToday.setUTCHours(0, 0, 0, 0);

            const fiveDaysAhead = new Date(startOfToday.getTime() + 5 * 24 * 60 * 60 * 1000);

            const filter: Record<string, any> = {
                forecastDate: { $gte: startOfToday, $lt: fiveDaysAhead },
            };

            if (regionId) {
                filter.regionId = regionId;
            }

            console.log(filter)

            const forecasts = await ForecastEnergyModel.find(filter)
                .sort({ forecastDate: 1 })
                .populate("regionId")   

            return forecasts.map((f) => toPlainObject<ForecastEnergyResponse>(f));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar previsões energéticas dos próximos 5 dias.");
        }
    },
    findForecastById: async (forecastId: string) => {
        try {
            const forecast = await ForecastEnergyModel.findById(forecastId);
            return forecast ? toPlainObject(forecast) : null;
        } catch {
            throw new DatabaseError("Erro ao buscar previsão energética por ID.");
        }
    },
};

const Mutation = {
    createForecast: async (data: ICreateForecastEnergy) => {
        try {
            const created = await ForecastEnergyModel.create({
                ...data,
                regionId: data.regionId ? new Types.ObjectId(data.regionId) : undefined,
                weatherId: data.weatherId ? new Types.ObjectId(data.weatherId) : undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return toPlainObject(created);
        } catch {
            throw new DatabaseError("Erro ao criar previsão energética no banco de dados.");
        }
    },

    bulkInsert: async (data: ICreateForecastEnergy[]) => {
        try {
            await ForecastEnergyModel.insertMany(data, { ordered: false });
        } catch {
            throw new DatabaseError("Erro ao inserir previsões energéticas em massa.");
        }
    },

    deleteForecastsByRegion: async (regionId: string) => {
        try {
            await ForecastEnergyModel.deleteMany({ regionId });
        } catch {
            throw new DatabaseError("Erro ao deletar previsões energéticas por região.");
        }
    },
};

export const forecastEnergyRepository = { Query, Mutation };
