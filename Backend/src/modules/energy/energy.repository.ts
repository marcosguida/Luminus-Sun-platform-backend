import { DatabaseError } from "@/lib/errors/DatabaseError";
import { EnergyModel, IEnergy } from "./energy.model";
import { ICreateEnergy, IUpdateEnergy } from "./energy.model";
import { toPlainObject } from "@/lib/utils";
import { EnergyResponse } from "./energy.dto";

const Query = {
    findEnergyById: async (energyId: string): Promise<EnergyResponse | null> => {
        try {
            const energy = await EnergyModel.findById(energyId);
            return energy ? toPlainObject<EnergyResponse>(energy) : null;
        } catch (error) {
            throw new DatabaseError("Erro ao buscar registro energético por ID.");
        }
    },

    findAllEnergies: async (): Promise<EnergyResponse[]> => {
        try {
            const energies = await EnergyModel.find().sort({ timestamp: -1 });
            return energies.map((r) => toPlainObject<EnergyResponse>(r));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar todos os registros energéticos.");
        }
    },

    findEnergiesByRegion: async (regionName: string): Promise<EnergyResponse[]> => {
        try {
            const energies = await EnergyModel.find({ regionName }).sort({ timestamp: -1 });
            return energies.map((r) => toPlainObject<EnergyResponse>(r));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar registros energéticos por região.");
        }
    },

    findEnergiesByType: async (energyType: string): Promise<EnergyResponse[]> => {
        try {
            const energies = await EnergyModel.find({ energyType }).sort({ timestamp: -1 });
            return energies.map((r) => toPlainObject<EnergyResponse>(r));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar registros energéticos por tipo.");
        }
    },

    findEnergiesByDate: async (timestamp: Date): Promise<EnergyResponse[]> => {
        try {
            const start = new Date(timestamp);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(timestamp);
            end.setUTCHours(23, 59, 59, 999);

            const energies = await EnergyModel.find({
                timestamp: { $gte: start, $lte: end },
            }).sort({ timestamp: -1 });

            return energies.map((r) => toPlainObject<EnergyResponse>(r));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar registros energéticos por data.");
        }
    },

    existsEnergyForRegionAndTimestamp: async (
        regionName: string,
        energyType: string,
        timestamp: Date
    ): Promise<boolean> => {
        try {
            const exists = await EnergyModel.exists({ regionName, energyType, timestamp });
            return !!exists;
        } catch (error) {
            throw new DatabaseError("Erro ao verificar existência de registro energético duplicado.");
        }
    },
};

const Mutation = {
    createEnergy: async (energyData: ICreateEnergy): Promise<EnergyResponse> => {
        try {
            const newEnergy = await EnergyModel.create(energyData);
            return toPlainObject<EnergyResponse>(newEnergy);
        } catch (error) {
            throw new DatabaseError("Erro ao criar registro energético.");
        }
    },

    updateEnergy: async ({
        energyId,
        energyData,
    }: {
        energyId: string;
        energyData: IUpdateEnergy;
    }): Promise<EnergyResponse | null> => {
        try {
            const updatedEnergy = await EnergyModel.findByIdAndUpdate(
                energyId,
                { $set: { ...energyData, updatedAt: new Date() } },
                { new: true }
            );
            return updatedEnergy ? toPlainObject<EnergyResponse>(updatedEnergy) : null;
        } catch (error) {
            throw new DatabaseError("Erro ao atualizar registro energético.");
        }
    },

    deleteEnergy: async (energyId: string): Promise<boolean> => {
        try {
            const deleted = await EnergyModel.findByIdAndDelete(energyId);
            return !!deleted;
        } catch (error) {
            throw new DatabaseError("Erro ao deletar registro energético.");
        }
    },

    bulkInsert: async (energies: ICreateEnergy[]): Promise<void> => {
        try {
            if (!energies.length) return;
            await EnergyModel.insertMany(energies, { ordered: false });
        } catch (error) {
            throw new DatabaseError("Erro ao inserir registros energéticos em massa.");
        }
    },

    bulkInsertUnique: async (energies: ICreateEnergy[]): Promise<number> => {
        try {
            if (!energies.length) return 0;

            let inserted = 0;
            const operations = [];

            for (const energy of energies) {
                operations.push({
                    updateOne: {
                        filter: {
                            regionName: energy.regionName,
                            energyType: energy.energyType,
                            timestamp: energy.timestamp,
                        },
                        update: { $setOnInsert: energy },
                        upsert: true,
                    },
                });
            }

            const result = await EnergyModel.bulkWrite(operations, { ordered: false });
            inserted = result.upsertedCount || 0;

            return inserted;
        } catch (error) {
            throw new DatabaseError("Erro ao inserir registros energéticos sem duplicatas.");
        }
    },
};

export const energyRepository = {
    Query,
    Mutation,
};
