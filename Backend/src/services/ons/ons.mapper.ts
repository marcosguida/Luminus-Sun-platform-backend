import { BrazilianRegion, EnergyType, ICreateEnergy } from "@/modules/energy/energy.model";

export const mapONSSolarGenerationToEnergyModel = (
    data: any[],
    region: BrazilianRegion
): ICreateEnergy[] => {
    if (!Array.isArray(data)) return [];

    return data.map((entry: any) => ({
        regionName: region,
        energyType: EnergyType.SOLAR,
        generationMW: entry.geracao ?? 0,
        source: "ONS API",
        timestamp: new Date(entry.instante),
    }));
};
