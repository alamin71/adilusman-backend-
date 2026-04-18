import { model, Schema } from 'mongoose';
import { IFavorite, IReciter, ISura } from './quran.interface';

const reciterSchema = new Schema<IReciter>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const suraSchema = new Schema<ISura>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    suraNumber: {
      type: Number,
      min: 1,
    },
    reciter: {
      type: Schema.Types.ObjectId,
      ref: 'Reciter',
      required: true,
      index: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    fileFormat: {
      type: String,
      default: 'unknown',
    },
    durationInSeconds: {
      type: Number,
      min: 0,
    },
    totalListens: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDownloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const favoriteSchema = new Schema<IFavorite>(
  {
    guestId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sura: {
      type: Schema.Types.ObjectId,
      ref: 'Sura',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

suraSchema.index({ title: 1, reciter: 1 });
favoriteSchema.index({ guestId: 1, sura: 1 }, { unique: true });

export const Reciter = model<IReciter>('Reciter', reciterSchema);
export const Sura = model<ISura>('Sura', suraSchema);
export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
