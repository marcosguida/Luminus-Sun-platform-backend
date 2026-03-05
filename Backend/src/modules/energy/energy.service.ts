import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors/AppError";
import { energyRepository } from "./energy.repository";
import {
    CreateEnergyRequest,
    UpdateEnergyRequest,
    EnergyResponse,
} from "./energy.dto";
import { BrazilianRegion, EnergyType, ICreateEnergy } from "./energy.model";
import { ONSService } from "@/services/ons/ons.service";

const Query = {
    findEnergyById: async (energyId: string): Promise<EnergyResponse> => {
        if (!energyId) throw new BadRequestError("ID do registro energético é obrigatório.");

        const energy = await energyRepository.Query.findEnergyById(energyId);
        if (!energy) throw new NotFoundError("Registro energético não encontrado.");

        return energy;
    },

    findAllEnergies: async (): Promise<EnergyResponse[]> => {
        return await energyRepository.Query.findAllEnergies();
    },

    findEnergiesByRegion: async (region: string): Promise<EnergyResponse[]> => {
        if (!region) throw new BadRequestError("A região é obrigatória para esta consulta.");

        const energies = await energyRepository.Query.findEnergiesByRegion(region);
        if (!energies?.length) throw new NotFoundError("Nenhum registro energético encontrado para esta região.");

        return energies;
    },

    findEnergiesByType: async (energyType: string): Promise<EnergyResponse[]> => {
        if (!energyType) throw new BadRequestError("O tipo de energia é obrigatório para esta consulta.");

        const energies = await energyRepository.Query.findEnergiesByType(energyType);
        if (!energies?.length) throw new NotFoundError("Nenhum registro encontrado para este tipo de energia.");

        return energies;
    },

    findEnergiesByDate: async (date: Date): Promise<EnergyResponse[]> => {
        if (!date) throw new BadRequestError("A data é obrigatória para esta consulta.");

        const energies = await energyRepository.Query.findEnergiesByDate(date);
        if (!energies?.length) throw new NotFoundError("Nenhum registro energético encontrado para esta data.");

        return energies;
    },
};

const Mutation = {
    createEnergy: async (energyData: CreateEnergyRequest): Promise<EnergyResponse> => {
        const { regionName, energyType, generationMW, timestamp } = energyData;

        if (!energyType || generationMW === undefined)
            throw new BadRequestError("Campos obrigatórios ausentes: tipo de energia e geração (MW).");

        if (timestamp && regionName) {
            const exists = await energyRepository.Query.existsEnergyForRegionAndTimestamp(
                regionName,
                energyType,
                timestamp,
            );
            if (exists) throw new ConflictError("Já existe um registro energético para esta região e horário.");
        }

        return await energyRepository.Mutation.createEnergy(energyData);
    },

    updateEnergy: async (energyId: string, energyData: UpdateEnergyRequest): Promise<EnergyResponse> => {
        if (!energyId) throw new BadRequestError("ID do registro energético é obrigatório.");

        const existingEnergy = await energyRepository.Query.findEnergyById(energyId);
        if (!existingEnergy) throw new NotFoundError("Registro energético não encontrado.");

        const updatedEnergy = await energyRepository.Mutation.updateEnergy({ energyId, energyData });
        if (!updatedEnergy) throw new BadRequestError("Falha ao atualizar o registro energético.");

        return updatedEnergy;
    },

    deleteEnergy: async (energyId: string): Promise<{ message: string }> => {
        if (!energyId) throw new BadRequestError("ID do registro energético é obrigatório.");

        const existingEnergy = await energyRepository.Query.findEnergyById(energyId);
        if (!existingEnergy) throw new NotFoundError("Registro energético não encontrado.");

        const deleted = await energyRepository.Mutation.deleteEnergy(energyId);
        if (!deleted) throw new BadRequestError("Falha ao deletar o registro energético.");

        return { message: "Registro energético deletado com sucesso." };
    },

    bulkInsert: async (energies: CreateEnergyRequest[]): Promise<{ message: string }> => {
        if (!energies?.length)
            throw new BadRequestError("Nenhum registro energético fornecido para inserção em massa.");

        await energyRepository.Mutation.bulkInsert(energies);
        return { message: "Registros energéticos inseridos com sucesso." };
    },

    bulkInsertUnique: async (energies: CreateEnergyRequest[]): Promise<{ inserted: number }> => {
        if (!energies?.length)
            throw new BadRequestError("Nenhum registro energético fornecido para inserção em massa.");

        const inserted = await energyRepository.Mutation.bulkInsertUnique(energies);
        return { inserted };
    },

    syncONS: async (): Promise<{ inserted: number }> => {
        try {
            console.log("⚡ [SYNC] Iniciando coleta de dados da ONS...");

            const data = await ONSService.fetchAllRegionsSolarGeneration();

            if (!data?.length) {
                console.log("⚠️ Nenhum dado de geração solar encontrado na ONS.");
                return { inserted: 0 };
            }

            const inserted = await energyRepository.Mutation.bulkInsertUnique(data);

            console.log(`✅ [SYNC] Inseridos ${inserted} novos registros de geração solar da ONS.`);
            return { inserted };
        } catch (error: any) {
            console.error("❌ [SYNC] Erro ao sincronizar dados da ONS:", error.message);
            throw new BadRequestError("Erro ao sincronizar dados da ONS.");
        }
    },
};

export const energyService = {
    Query,
    Mutation,
};
