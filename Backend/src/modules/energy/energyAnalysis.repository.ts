import { DatabaseError } from "@/lib/errors/DatabaseError";
import {
    EnergyModel,
    IEnergy,
    BrazilianRegion,
    EnergyType,
} from "@/modules/energy/energy.model";
import { ForecastEnergyModel, IForecastEnergy } from "@/modules/forecast/forecastEnergy.model";
import { toPlainObject } from "@/lib/utils";

export const energyAnalysisRepository = {
    findRealEnergyByRegionAndTime: async (
        region: BrazilianRegion,
        start: Date,
        end: Date
    ): Promise<IEnergy[]> => {
        try {
            const energies = await EnergyModel.find({
                regionName: region,
                energyType: EnergyType.SOLAR,
                timestamp: { $gte: start, $lte: end },
            }).sort({ timestamp: 1 });

            // ✅ Tipar corretamente como IEnergy[]
            return energies.map((e) => toPlainObject<IEnergy>(e));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar dados reais de geração energética.");
        }
    },

    findForecastsByTimeRange: async (
        start: Date,
        end: Date
    ): Promise<IForecastEnergy[]> => {
        try {
            const forecasts = await ForecastEnergyModel.find({
                forecastDate: { $gte: start, $lte: end },
            }).sort({ forecastDate: 1 });

            // ✅ Tipar corretamente como IForecastEnergy[]
            return forecasts.map((f) => toPlainObject<IForecastEnergy>(f));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar previsões energéticas no intervalo de tempo.");
        }
    },

    findClosestForecastForEnergy: async (
        timestamp: Date
    ): Promise<IForecastEnergy | null> => {
        try {
            const toleranceMs = 1000 * 60 * 15; // 15 minutos
            const start = new Date(timestamp.getTime() - toleranceMs);
            const end = new Date(timestamp.getTime() + toleranceMs);

            const forecast = await ForecastEnergyModel.findOne({
                forecastDate: { $gte: start, $lte: end },
            });

            return forecast ? toPlainObject<IForecastEnergy>(forecast) : null;
        } catch (error) {
            throw new DatabaseError("Erro ao buscar previsão energética próxima ao horário informado.");
        }
    },
};
