import { Document, model, Schema } from 'mongoose';

export interface IWeatherBase {
  regionId?: string;
  temperature: number;              // Temperatura média do período
  feelsLike?: number;               // Sensação térmica (importante para análise térmica)
  minTemp?: number;                 // Temperatura mínima
  maxTemp?: number;                 // Temperatura máxima
  humidity: number;                 // Umidade relativa
  pressure?: number;                // Pressão atmosférica
  windSpeed?: number;               // Velocidade do vento (m/s)
  windDeg?: number;                 // Direção do vento (graus)
  clouds?: number;                  // Cobertura de nuvens (%)
  visibility?: number;              // Visibilidade em metros
  rainVolume?: number;              // Volume de chuva (mm)
  solarIrradiance?: number;         // Irradiância solar estimada (W/m²)
  description?: string;             // Descrição geral ("nublado", "céu limpo", etc.)
  source?: string;                  // Origem dos dados (OpenWeather, INMET, etc.)
  timestamp?: Date;                 // Momento da medição
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IWeather extends IWeatherBase, Document {  }

export interface ICreateWeather extends Omit<IWeatherBase, 'createdAt' | 'updatedAt'> { }

export interface IUpdateWeather extends Partial<Omit<IWeatherBase, 'createdAt' | 'updatedAt'>> { }

const WeatherSchema = new Schema<IWeather>({
  regionId: { type: Schema.Types.ObjectId, ref: "Region" },
  temperature: { type: Number, required: true },
  feelsLike: { type: Number },
  minTemp: { type: Number },
  maxTemp: { type: Number },
  humidity: { type: Number, required: true },
  pressure: { type: Number },
  windSpeed: { type: Number },
  windDeg: { type: Number },
  clouds: { type: Number },
  visibility: { type: Number },
  rainVolume: { type: Number },
  solarIrradiance: { type: Number },
  description: { type: String },
  source: { type: String, default: "OpenWeather" },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WeatherSchema.index({ regionId: 1, timestamp: 1 }, { unique: true });

export const WeatherModel = model<IWeather>('Weather', WeatherSchema);
