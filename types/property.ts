import { Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  // Add other fields from your property schema
}

export type PropertyCreateInput = Omit<Partial<IProperty>, "_id"> & { _id?: string };
