import { IWeather } from "@/modules/weather/weather.model";
import { estimateGHI } from "./estimateGHI";
import { ICreateForecastEnergy, IForecastEnergy } from "@/modules/forecast/forecastEnergy.model";
import { WeatherResponse } from "@/modules/weather/weather.dto";

export const estimateForecastFromWeather = (
    weather: WeatherResponse,
    region: { latitude: number; longitude: number; altitude?: number },
    panelArea = 3,
    basePanelEfficiency = 0.20,
    systemPerformanceRatio = 0.85
): ICreateForecastEnergy => {
    const GHI = estimateGHI({
        lat: region.latitude,
        lon: region.longitude,
        date: new Date(weather?.timestamp),
        clouds: weather.clouds ?? 0,
        altitudeM: region.altitude ?? 0,
    });

    const temp = weather.temperature ?? 25;
    const wind = weather.windSpeed ?? 0;

    let correctedPanelEfficiency = basePanelEfficiency * (1 - 0.004 * (temp - 25));
    correctedPanelEfficiency *= 1 + 0.002 * wind;

    correctedPanelEfficiency = Math.max(0.15, Math.min(correctedPanelEfficiency, 0.25));

    // GHI (W/m²) * Area (m²) * EficiênciaPainel (%) * EficiênciaSistema (%)
    const predictedEnergy =
        (GHI * panelArea * correctedPanelEfficiency * systemPerformanceRatio) / 1000; // Converte W para kW

    const finalSystemEfficiency = correctedPanelEfficiency * systemPerformanceRatio;

    const savingsEstimate = predictedEnergy * 0.75;
    const co2Reduction = predictedEnergy * 0.85;
    const confidenceLevel = Math.min(0.95, 0.8 + (finalSystemEfficiency - 0.15));

    const recommendation =
        predictedEnergy > 8
            ? "Alta geração esperada — mantenha painéis limpos e bem orientados."
            : "Geração reduzida — cobertura de nuvens ou baixa incidência solar.";

    return {
        regionId: weather.regionId,
        weatherId: (weather._id as any).toString(),
        forecastDate: new Date(weather?.timestamp),
        irradiance: GHI,
        predictedEnergy,
        efficiencyRate: finalSystemEfficiency,
        savingsEstimate,
        co2Reduction,
        confidenceLevel,
        recommendation,
    };
}
