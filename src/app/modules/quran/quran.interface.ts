import { Types } from 'mongoose';

export interface IReciter {
  name: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISura {
  title: string;
  suraNumber?: number;
  reciter: Types.ObjectId;
  audioUrl: string;
  fileFormat?: string;
  durationInSeconds?: number;
  totalListens?: number;
  totalDownloads?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFavorite {
  guestId: string;
  sura: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
