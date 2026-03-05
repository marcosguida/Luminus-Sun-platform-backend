import { BrazilianRegion } from "@/modules/energy/energy.model";
import { energyAnalysisRepository } from "./energyAnalysis.repository";

export const energyAnalysisService = {
    getPerformanceReport: async (region: BrazilianRegion, hoursBack: number = 6) => {
        const now = new Date();
        const start = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

        const realData = await energyAnalysisRepository.findRealEnergyByRegionAndTime(region, start, now);
        const forecasts = await energyAnalysisRepository.findForecastsByTimeRange(start, now);

        if (!realData.length)
            return { message: `Nenhum dado real encontrado para ${region}.` };
        if (!forecasts.length)
            return { message: "Nenhum dado previsto encontrado nesse período." };

        const results: {
            timestamp: Date;
            region: BrazilianRegion;
            realKW: number;
            predictedKW: number;
            diffKW: number;
            errorPct: number;
            confidenceLevel: number | null;
        }[] = [];

        for (const real of realData) {
            const closestForecast = await energyAnalysisRepository.findClosestForecastForEnergy(
                new Date(real.timestamp!)
            );

            if (!closestForecast) continue;

            const realKW = real.generationMW * 1000;
            const predictedKW = closestForecast.predictedEnergy;
            const diff = realKW - predictedKW;
            const errorPct = (diff / realKW) * 100;

            results.push({
                timestamp: real.timestamp!,
                region,
                realKW,
                predictedKW,
                diffKW: diff,
                errorPct: parseFloat(errorPct.toFixed(2)),
                confidenceLevel: closestForecast.confidenceLevel ?? null,
            });
        }

        const totalRealKW = results.reduce((acc, r) => acc + r.realKW, 0);
        const totalPredictedKW = results.reduce((acc, r) => acc + r.predictedKW, 0);
        const avgError = results.reduce((acc, r) => acc + Math.abs(r.errorPct), 0) / results.length;

        return {
            region,
            hoursAnalyzed: hoursBack,
            totalRealKW: parseFloat(totalRealKW.toFixed(2)),
            totalPredictedKW: parseFloat(totalPredictedKW.toFixed(2)),
            averageErrorPct: parseFloat(avgError.toFixed(2)),
            dataPoints: results.length,
            details: results,
        };
    },
};
