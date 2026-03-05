import { BadRequestError, ConflictError, ForbiddenError } from '../../lib/errors/AppError'
import axios from "axios";
import {
    IBGEStateResponse,
    IBGECityResponse,
    State,
    City,
} from "./ibgeGeocoding.types";

const BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export const ibgeGeocodingService = {
    getAllStates: async (): Promise<State[]> => {
        try {
            const { data } = await axios.get<IBGEStateResponse[]>(`${BASE_URL}/estados`);

            return data.map((state) => ({
                id: state.id,
                name: state.nome,
                uf: state.sigla,
                regionName: state.regiao.nome,
                regionCode: state.regiao.sigla,
            }));
        } catch (error) {
            throw new BadRequestError("Erro ao buscar os estados no IBGE.");
        }
    },

    getAllCitiesByState: async (uf: string): Promise<City[]> => {
        const ufUpper = uf.toUpperCase();

        const { data } = await axios.get<IBGECityResponse[]>(
            `${BASE_URL}/estados/${ufUpper}/municipios`
        );

        return data.map((city) => {
            try {
                if (city.microrregiao) {
                    return {
                        id: city.id,
                        name: city.nome,
                        uf: ufUpper,
                        stateName: city.microrregiao.mesorregiao.UF.nome,
                        regionName: city.microrregiao.mesorregiao.UF.regiao.nome,
                    };
                }

                if (city["regiao-imediata"]) {
                    return {
                        id: city.id,
                        name: city.nome,
                        uf: ufUpper,
                        stateName: city["regiao-imediata"]["regiao-intermediaria"].UF.nome,
                        regionName: city["regiao-imediata"]["regiao-intermediaria"].UF.regiao.nome,
                    };
                }

                console.warn(`Cidade sem formato reconhecido: ${city.nome}`);
                return {
                    id: city.id,
                    name: city.nome,
                    uf: ufUpper,
                    stateName: "Desconhecido",
                    regionName: "Desconhecido",
                };
            } catch (error) {
                throw new BadRequestError(`Erro ao processar a cidade: ${city.nome}`);
            }
        });
    },
};