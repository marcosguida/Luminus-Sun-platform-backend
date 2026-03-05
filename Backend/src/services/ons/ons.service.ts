import axios from "axios";
import { BrazilianRegion, ICreateEnergy } from "@/modules/energy/energy.model";
import { mapONSSolarGenerationToEnergyModel } from "./ons.mapper";

export const RegionKeyMap: Record<BrazilianRegion, string> = {
    [BrazilianRegion.NORTE]: "Geracao_Norte_Solar_json",
    [BrazilianRegion.NORDESTE]: "Geracao_Nordeste_Solar_json",
    [BrazilianRegion.CENTRO_OESTE]: "Geracao_Centro-Oeste_Solar_json",
    [BrazilianRegion.SUDESTE]: "Geracao_Suldeste_Solar_json",
    [BrazilianRegion.SUL]: "Geracao_Sul_Solar_json",
};

const BASE_URL = "https://tr.ons.org.br/Content/Get";

export const ONSService = {
    getSolarGenerationByRegion: async (regionKey: string) => {
        const url = `${BASE_URL}/${regionKey}`;
        const { data } = await axios.get(url);
        return data;
    },
    fetchAllRegionsSolarGeneration: async (): Promise<ICreateEnergy[]> => {
        const allData: ICreateEnergy[] = [];

        for (const region of Object.values(BrazilianRegion)) {
            const key = RegionKeyMap[region];
            try {
                const rawData = await ONSService.getSolarGenerationByRegion(key);
                const mapped = mapONSSolarGenerationToEnergyModel(rawData, region);
                allData.push(...mapped);
            } catch (error) {
                console.error(`❌ Erro ao buscar dados da ONS para ${region}:`, error);
            }
        }

        return allData;
    }
};