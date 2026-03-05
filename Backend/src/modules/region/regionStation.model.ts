import { Document, model, Schema } from 'mongoose';

export interface IRegionStationBase {
    name: string;
    uf: string;
    latitude?: number;
    longitude?: number;
    stationCode?: string;
    stationType?: string;
    status?: string;
    altitude?: number;
    location: {
        type: "Point";
        coordinates: number[];
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRegionStation extends IRegionStationBase, Document { }

export interface ICreateRegionStation extends Omit<IRegionStationBase, 'createdAt' | 'updatedAt'> { }

export interface IUpdateRegionStation extends Partial<Omit<IRegionStationBase, 'createdAt' | 'updatedAt'>> { }

const RegionStationSchema = new Schema<IRegionStation>({
    name: { type: String, required: true },
    uf: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    stationCode: { type: String },
    stationType: { type: String },
    status: { type: String },
    altitude: { type: Number },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true, // [longitude, latitude]
        },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

RegionStationSchema.index({ location: "2dsphere" });

export const RegionStationModel = model<IRegionStation>('RegionStation', RegionStationSchema);
