import { Document, Schema, model } from "mongoose";

export interface IForecastEnergyBase {
  regionId?: string;
  weatherId?: string;
  forecastDate: Date;
  irradiance: number;        // Irradiância solar estimada (W/m²)
  predictedEnergy: number;   // Energia gerada estimada (kWh)
  efficiencyRate?: number;   // Eficiência do sistema fotovoltaico (%)
  savingsEstimate?: number;  // Economia estimada (R$)
  co2Reduction?: number;     // Redução de CO₂ (kg)
  confidenceLevel?: number;  // Nível de confiança do modelo (%)
  recommendation?: string;   // Ex: “Limpar painéis”, “Alta geração esperada”
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IForecastEnergy extends IForecastEnergyBase, Document {}
export interface ICreateForecastEnergy extends Omit<IForecastEnergyBase, "createdAt" | "updatedAt"> {}
export interface IUpdateForecastEnergy extends Partial<Omit<IForecastEnergyBase, "createdAt" | "updatedAt">> {}

const ForecastEnergySchema = new Schema<IForecastEnergy>({
  regionId: { type: Schema.Types.ObjectId, ref: "RegionStation" },
  weatherId: { type: Schema.Types.ObjectId, ref: "Weather" },
  forecastDate: { type: Date, required: true },
  irradiance: { type: Number, required: true },
  predictedEnergy: { type: Number, required: true },
  efficiencyRate: { type: Number },
  savingsEstimate: { type: Number },
  co2Reduction: { type: Number },
  confidenceLevel: { type: Number },
  recommendation: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ForecastEnergyModel = model<IForecastEnergy>("ForecastEnergy", ForecastEnergySchema);
