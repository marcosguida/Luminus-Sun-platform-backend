import axios from "axios";
import { regionStationRepository } from "@/modules/region/regionStation.repository";
import { InmetStation } from "./inmet.types";

export const inmetStationService = {
    syncStations: async () => {
        const url = "https://apitempo.inmet.gov.br/estacoes/T";
        const { data } = await axios.get(url);

        const formattedData = data
            .filter((station: InmetStation) => station.CD_SITUACAO !== "Pane")
            .map((station: InmetStation) => {
                const latitude = parseFloat(station.VL_LATITUDE);
                const longitude = parseFloat(station.VL_LONGITUDE);

                if (isNaN(latitude) || isNaN(longitude)) {
                    console.warn(`Ignorando estação com coordenadas inválidas: ${station.DC_NOME}`);
                    return null;
                }

                return {
                    name: station.DC_NOME,
                    uf: station.SG_ESTADO,
                    latitude,
                    longitude,
                    stationCode: station.CD_ESTACAO,
                    stationType: station.TP_ESTACAO,
                    status: station.CD_SITUACAO,
                    altitude: station.VL_ALTITUDE ? parseFloat(station.VL_ALTITUDE) : undefined,
                    location: {
                        type: "Point" as const,
                        coordinates: [longitude, latitude],
                    },
                };
            })
            .filter(Boolean);

        await regionStationRepository.Mutation.bulkInsert(formattedData);

        return { count: formattedData.length };
    },
};
