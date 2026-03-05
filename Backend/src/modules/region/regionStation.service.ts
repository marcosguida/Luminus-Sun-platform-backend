import { IRegionStation } from "./regionStation.model";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors/AppError";
import { regionStationRepository } from "./regionStation.repository";
import { CreateRegionStationRequest, UpdateRegionStationRequest, RegionStationResponse } from "./regionStation.dto";

const Query = {
    findRegionStationById: async (regionStationId: string): Promise<RegionStationResponse | null> => {
        try {
            if (!regionStationId) {
                throw new BadRequestError("ID da região é obrigatório.");
            }

            const regionStation = await regionStationRepository.Query.findRegionStationById(regionStationId);
            if (!regionStation) {
                throw new NotFoundError("Região não encontrada.");
            }

            return regionStation;
        } catch (error) {
            throw error;
        }
    },

    findAllRegionStations: async (): Promise<RegionStationResponse[]> => {
        try {
            return await regionStationRepository.Query.findAllRegionStations();
        } catch (error) {
            throw error;
        }
    },

    findRegionStationsByUf: async (uf: string): Promise<RegionStationResponse[]> => {
        try {
            if (!uf) {
                throw new BadRequestError("UF da região é obrigatória.");
            }

            const regionStations = await regionStationRepository.Query.findRegionStationsByUf(uf.toUpperCase());
            if (!regionStations || regionStations.length === 0) {
                throw new NotFoundError("Nenhuma região encontrada para esta UF.");
            }

            return regionStations;
        } catch (error) {
            throw error;
        }
    },

    findRegionStationsByName: async (name: string): Promise<RegionStationResponse[]> => {
        try {
            if (!name) {
                throw new BadRequestError("Nome da região é obrigatório.");
            }

            const regionStations = await regionStationRepository.Query.findRegionStationsByName(name);
            if (!regionStations || regionStations.length === 0) {
                throw new NotFoundError("Nenhuma região encontrada com este nome.");
            }

            return regionStations;
        } catch (error) {
            throw error;
        }
    },
};

const Mutation = {
    createRegionStation: async (regionStationData: CreateRegionStationRequest): Promise<RegionStationResponse> => {
        try {
            const { name, uf, latitude, longitude } = regionStationData;

            if (!name || !uf) throw new BadRequestError("Nome e UF são obrigatórios.");

            if (latitude === undefined || longitude === undefined) {
                throw new BadRequestError("Latitude e longitude são obrigatórias.");
            }

            const existing = await regionStationRepository.Query.findRegionStationsByName(name);
            const conflict = existing.find((s) => s.uf === uf);
            if (conflict) throw new ConflictError("Já existe uma estação cadastrada com este nome neste estado.");

            const location = {
                type: "Point" as const,
                coordinates: [longitude, latitude],
            };

            const newStation = await regionStationRepository.Mutation.createRegionStation({
                ...regionStationData,
                location,
            });

            return newStation;
        } catch (error) {
            throw error;
        }
    },

    updateRegionStation: async (regionStationId: string, regionStationData: UpdateRegionStationRequest): Promise<RegionStationResponse> => {
        try {
            if (!regionStationId) {
                throw new BadRequestError("ID da região é obrigatório.");
            }

            const existingRegionStation = await regionStationRepository.Query.findRegionStationById(regionStationId);
            if (!existingRegionStation) {
                throw new NotFoundError("Região não encontrada.");
            }

            const { name, uf, latitude, longitude } = regionStationData;

            if (name) {
                const regionStationsWithSameName = await regionStationRepository.Query.findRegionStationsByName(name);
                const nameConflict = regionStationsWithSameName.find(
                    (regionStation) => regionStation._id.toString() !== regionStationId
                );
                if (nameConflict) {
                    throw new ConflictError("Já existe uma região com este nome.");
                }
            }

            let location = existingRegionStation.location;
            if (regionStationData.latitude !== undefined && regionStationData.longitude !== undefined) {
                location = {
                    type: "Point" as const,
                    coordinates: [regionStationData.longitude, regionStationData.latitude],
                };
            }

            const updatedRegionStation = await regionStationRepository.Mutation.updateRegionStation({
                regionStationId,
                regionStationData: { name, uf, latitude, longitude, location },
            });

            if (!updatedRegionStation) {
                throw new BadRequestError("Falha ao atualizar a região.");
            }

            return updatedRegionStation;
        } catch (error) {
            throw error;
        }
    },

    deleteRegionStation: async (regionStationId: string): Promise<{ message: string }> => {
        try {
            if (!regionStationId) {
                throw new BadRequestError("ID da região é obrigatório.");
            }

            const existingRegionStation = await regionStationRepository.Query.findRegionStationById(regionStationId);
            if (!existingRegionStation) {
                throw new NotFoundError("Região não encontrada.");
            }

            const deleted = await regionStationRepository.Mutation.deleteRegionStation(regionStationId);
            if (!deleted) {
                throw new BadRequestError("Falha ao deletar a região.");
            }

            return { message: "Região deletada com sucesso." };
        } catch (error) {
            throw error;
        }
    },
};

export const regionStationService = {
    Query,
    Mutation,
};
