import { env } from "@/config/env";
import { toPlainObject } from "@/lib/utils";
import { RegionStationResponse } from "@/modules/region/regionStation.dto";
import { RegionStationModel } from "@/modules/region/regionStation.model";
import axios from "axios";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors/AppError"
import { regionStationRepository } from "@/modules/region/regionStation.repository";

const API_KEY = env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/geo/1.0";

async function calculateDistanceKm({ lat1, lon1, lat2, lon2 }: { lat1: number, lon1: number, lat2: number, lon2: number }): Promise<number> {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const UF_TO_STATE_NAME: Record<string, string> = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins",
};

export const geocodingService = {
    getCoordinatesByCity: async ({ city, state, country = "BR" }: { city: string, state?: string, country?: string }) => {
        try {
            const fullStateName = (state && UF_TO_STATE_NAME[state.toUpperCase()]) || state || null;

            const query = fullStateName ? `${city},${fullStateName},${country}` : `${city},${country}`;

            const url = `${BASE_URL}/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;
            console.log("Geocoding URL:", url);

            const { data } = await axios.get(url);
            if (!data || data.length === 0) throw new NotFoundError("Localização não encontrada.");

            const location = data[0];
            return {
                name: location.name,
                lat: location.lat,
                lon: location.lon,
                country: location.country,
                state: location.state,
            };
        } catch (error) {
            throw error;
        }
    },
    findNearestStationByCity: async ({ city, state, country = "BR" }: { city: string, state?: string, country?: string }): Promise<RegionStationResponse> => {
        try {
            const location = await geocodingService.getCoordinatesByCity({
                city,
                state,
                country,
            });

            if (!location?.lat || !location?.lon) {
                throw new BadRequestError("Coordenadas do local não encontradas.");
            }

            console.log(`Buscando estação mais próxima para ${city}, ${state ?? ""}, ${country} nas coordenadas (${location.lat}, ${location.lon})`);

            const nearestStation = await regionStationRepository.Query.findRegionStationsByCoordinates({
                latitude: location.lat,
                longitude: location.lon,
                maxDistanceInMeters: 5000000,
            })

            console.log('Estação mais próxima encontrada:', nearestStation);

            if (!nearestStation) {
                throw new NotFoundError("Nenhuma estação encontrada próxima a este local.");
            }

            console.log(`Estação mais próxima encontrada: ${nearestStation?.name}`);

            return nearestStation;
        } catch (error) {
            throw error;
        }
    },
};
