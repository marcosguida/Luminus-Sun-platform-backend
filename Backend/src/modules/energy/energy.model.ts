import { Document, model, Schema } from 'mongoose';

export enum BrazilianRegion {
    NORTE = "norte",
    NORDESTE = "nordeste",
    CENTRO_OESTE = "centro-oeste",
    SUDESTE = "sudeste",
    SUL = "sul",
}

export enum EnergyType {
    EOLICA = "eolica",
    SOLAR = "solar",
    NUCLEAR = "nuclear",
    HIDRAULICA = "hidraulica",
    TERMICA = "termica",
}

export interface IEnergyBase {
    regionName?: BrazilianRegion;   // Nome da região (enum)
    energyType: EnergyType;         // Tipo de fonte energética
    generationMW: number;           // Potência gerada (MW)
    source?: string;                // Fonte dos dados (ex: ONS API)
    timestamp?: Date;               // Momento da coleta
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEnergy extends IEnergyBase, Document { }

export interface ICreateEnergy
    extends Omit<IEnergyBase, "createdAt" | "updatedAt"> { }

export interface IUpdateEnergy
    extends Partial<Omit<IEnergyBase, "createdAt" | "updatedAt">> { }

const EnergySchema = new Schema<IEnergy>({
    regionName: {
        type: String,
        enum: Object.values(BrazilianRegion),
    },
    energyType: {
        type: String,
        enum: Object.values(EnergyType),
        required: true
    },
    generationMW: { type: Number, required: true },
    source: { type: String, default: "ONS API" },
    timestamp: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const EnergyModel = model<IEnergy>('EnergyData', EnergySchema);
