import { DatabaseError } from "@/lib/errors/DatabaseError";
import { ICreateRegionStation, IUpdateRegionStation, RegionStationModel } from "./regionStation.model";
import { toPlainObject } from "@/lib/utils";
import { RegionStationResponse } from "./regionStation.dto";

const Query = {
    findRegionStationsByCoordinates: async ({latitude, longitude, maxDistanceInMeters}: {latitude: number, longitude: number, maxDistanceInMeters: number}): Promise<RegionStationResponse | null> => {
        try {
            return await RegionStationModel.findOne({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: maxDistanceInMeters
                    }
                }
            });
        } catch (error) {
            throw new DatabaseError("Erro ao buscar regiões por coordenadas no banco de dados.");
        }
    },
    findRegionStationById: async (regionStationId: string): Promise<RegionStationResponse | null> => {
        try {
            return await RegionStationModel.findById(regionStationId);
        } catch (error) {
            throw new DatabaseError("Erro ao buscar região por ID no banco de dados.");
        }
    },
    findRegionStationsByUf: async (uf: string): Promise<RegionStationResponse[]> => {
        try {
            return await RegionStationModel.find({ uf });
        } catch (error) {
            throw new DatabaseError("Erro ao buscar região por UF no banco de dados.");
        }
    },
    findRegionStationsByName: async (name: string): Promise<RegionStationResponse[]> => {
        try {
            return await RegionStationModel.find({ name });
        } catch (error) {
            throw new DatabaseError("Erro ao buscar região por nome no banco de dados.");
        }
    },
    findAllRegionStations: async (): Promise<RegionStationResponse[]> => {
        try {
            return await RegionStationModel.find();
        } catch (error) {
            throw new DatabaseError("Erro ao buscar todas as regiões no banco de dados.");
        }
    }
}

const Mutation = {
    createRegionStation: async (regionStationData: ICreateRegionStation): Promise<RegionStationResponse> => {
        try {
            const { name, uf, latitude, longitude } = regionStationData;

            const newRegionStation = await RegionStationModel.create({ name, uf: uf.toUpperCase(), latitude, longitude });

            return toPlainObject<RegionStationResponse>(newRegionStation);
        } catch (error) {
            throw new DatabaseError("Erro ao criar região no banco de dados.");
        }
    },
    updateRegionStation: async ({ regionStationId, regionStationData }: { regionStationId: string, regionStationData: IUpdateRegionStation }): Promise<RegionStationResponse | null> => {
        try {
            const { name, uf, latitude, longitude } = regionStationData;

            const updatedRegionStation = await RegionStationModel.findByIdAndUpdate(
                regionStationId,
                { $set: { name, uf: uf ? uf.toUpperCase() : undefined, latitude, longitude }, updatedAt: new Date() },
                { new: true }
            );

            return updatedRegionStation ? toPlainObject<RegionStationResponse>(updatedRegionStation) : null;
        } catch (error) {
            throw new DatabaseError("Erro ao atualizar região no banco de dados.");
        }
    },
    deleteRegionStation: async (regionStationId: string): Promise<boolean> => {
        try {
            const deletedRegionStation = await RegionStationModel.findByIdAndDelete(regionStationId);

            return !!deletedRegionStation;
        } catch (error) {
            throw new DatabaseError("Erro ao deletar região no banco de dados.");
        }
    },
    async bulkInsert(regionStations: any[]) {
        try {
            await RegionStationModel.insertMany(regionStations, { ordered: false });
        } catch (error) {
            throw new DatabaseError("Erro ao inserir regiões em massa no banco de dados.");
        }
    },
}

export const regionStationRepository = {
    Query,
    Mutation
}