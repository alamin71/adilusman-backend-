import { StatusCodes } from 'http-status-codes';
import { FilterQuery, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { uploadToS3 } from '../../../helpers/s3Helper';
import { Favorite, Reciter, Sura } from './quran.model';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const escapeRegex = (input: string) =>
  input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
};

const parsePagination = (page?: string, limit?: string) => {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  return {
    page:
      Number.isFinite(parsedPage) && parsedPage > 0
        ? Math.floor(parsedPage)
        : DEFAULT_PAGE,
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.floor(parsedLimit)
        : DEFAULT_LIMIT,
  };
};

const ensureSuraExists = async (suraId: string) => {
  if (!Types.ObjectId.isValid(suraId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid suraId');
  }

  const sura = await Sura.findById(suraId);

  if (!sura) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Sura not found');
  }

  return sura;
};

const resolveReciter = async (payload: {
  reciterId?: string;
  reciterName?: string;
  reciterImage?: string;
}) => {
  const { reciterId, reciterName, reciterImage } = payload;

  if (reciterId) {
    if (!Types.ObjectId.isValid(reciterId)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid reciterId');
    }

    const reciter = await Reciter.findById(reciterId);
    if (!reciter) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Reciter not found');
    }

    if (reciterImage) {
      reciter.image = reciterImage;
      await reciter.save();
    }

    return reciter;
  }

  if (!reciterName) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Either reciterId or reciterName is required'
    );
  }

  const existingReciter = await Reciter.findOne({
    name: {
      $regex: new RegExp(`^${escapeRegex(reciterName)}$`, 'i'),
    },
  });

  if (existingReciter) {
    if (reciterImage && !existingReciter.image) {
      existingReciter.image = reciterImage;
      await existingReciter.save();
    }

    return existingReciter;
  }

  return Reciter.create({
    name: reciterName,
    image: reciterImage || '',
  });
};

const getPublicRecitersFromDB = async (search?: string) => {
  const query: FilterQuery<typeof Reciter> = {
    isActive: true,
  };

  if (search) {
    query.name = {
      $regex: new RegExp(escapeRegex(search), 'i'),
    };
  }

  return Reciter.find(query).sort({ name: 1 });
};

const getPublicSurasFromDB = async (payload: {
  search?: string;
  reciterId?: string;
  page?: string;
  limit?: string;
}) => {
  const { search, reciterId, page, limit } = payload;
  const { page: currentPage, limit: perPage } = parsePagination(page, limit);

  const query: FilterQuery<typeof Sura> = {
    isActive: true,
  };

  if (search) {
    query.title = {
      $regex: new RegExp(escapeRegex(search), 'i'),
    };
  }

  if (reciterId) {
    if (!Types.ObjectId.isValid(reciterId)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid reciterId');
    }
    query.reciter = new Types.ObjectId(reciterId);
  }

  const [suras, total] = await Promise.all([
    Sura.find(query)
      .populate('reciter', 'name image')
      .sort({ suraNumber: 1, title: 1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage),
    Sura.countDocuments(query),
  ]);

  const suraData = suras.map((sura) => {
    const suraObject = sura.toObject();
    return {
      ...suraObject,
      playbackUrl: suraObject.audioUrl,
    };
  });

  return {
    data: suraData,
    meta: {
      page: currentPage,
      limit: perPage,
      total,
      totalPage: Math.ceil(total / perPage) || 1,
    },
  };
};

const getSingleSuraFromDB = async (suraId: string) => {
  await ensureSuraExists(suraId);

  const sura = await Sura.findById(suraId).populate('reciter', 'name image');

  if (!sura) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Sura not found');
  }

  const suraObject = sura.toObject();

  return {
    ...suraObject,
    playbackUrl: suraObject.audioUrl,
  };
};

const increaseListenCountInDB = async (suraId: string) => {
  await ensureSuraExists(suraId);

  return Sura.findByIdAndUpdate(
    suraId,
    { $inc: { totalListens: 1 } },
    { new: true }
  ).populate('reciter', 'name image');
};

const increaseDownloadCountInDB = async (suraId: string) => {
  await ensureSuraExists(suraId);

  return Sura.findByIdAndUpdate(
    suraId,
    { $inc: { totalDownloads: 1 } },
    { new: true }
  ).populate('reciter', 'name image');
};

const getSuraDownloadInfoFromDB = async (suraId: string) => {
  await ensureSuraExists(suraId);

  return Sura.findByIdAndUpdate(
    suraId,
    { $inc: { totalDownloads: 1 } },
    { new: true }
  ).select('title audioUrl fileFormat');
};

const addFavoriteToDB = async (guestId: string, suraId: string) => {
  await ensureSuraExists(suraId);

  const existing = await Favorite.findOne({ guestId, sura: suraId });

  if (existing) {
    return existing;
  }

  return Favorite.create({
    guestId,
    sura: suraId,
  });
};

const removeFavoriteFromDB = async (guestId: string, suraId: string) => {
  await ensureSuraExists(suraId);

  await Favorite.findOneAndDelete({ guestId, sura: suraId });

  return null;
};

const getFavoriteSurasFromDB = async (guestId: string) => {
  const favoriteRows = await Favorite.find({ guestId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'sura',
      populate: {
        path: 'reciter',
        select: 'name image',
      },
    });

  const favorites = favoriteRows
    .map((row) => row.sura)
    .filter((sura) => sura !== null);

  return favorites;
};

const createSuraByAdminToDB = async (payload: {
  title: string;
  reciterId?: string;
  reciterName?: string;
  suraNumber?: string;
  durationInSeconds?: string;
  audioFile?: Express.Multer.File;
  reciterImageFile?: Express.Multer.File;
}) => {
  const {
    title,
    reciterId,
    reciterName,
    suraNumber,
    durationInSeconds,
    audioFile,
    reciterImageFile,
  } = payload;

  if (!audioFile) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Audio file is required');
  }

  const audioUrl = await uploadToS3(audioFile, 'quran/suras');
  const reciterImage = reciterImageFile
    ? await uploadToS3(reciterImageFile, 'quran/reciters')
    : undefined;

  const reciter = await resolveReciter({
    reciterId,
    reciterName,
    reciterImage,
  });

  const createdSura = await Sura.create({
    title,
    reciter: reciter._id,
    audioUrl,
    fileFormat: audioFile.mimetype,
    suraNumber: parsePositiveNumber(suraNumber),
    durationInSeconds: parsePositiveNumber(durationInSeconds),
  });

  const populatedSura = await Sura.findById(createdSura._id).populate(
    'reciter',
    'name image'
  );

  if (!populatedSura) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Sura not found after upload');
  }

  const suraObject = populatedSura.toObject();

  return {
    ...suraObject,
    playbackUrl: suraObject.audioUrl,
  };
};

const getAdminSurasFromDB = async () => {
  return Sura.find({})
    .populate('reciter', 'name image')
    .sort({ createdAt: -1 });
};

export const QuranService = {
  getPublicRecitersFromDB,
  getPublicSurasFromDB,
  getSingleSuraFromDB,
  increaseListenCountInDB,
  increaseDownloadCountInDB,
  getSuraDownloadInfoFromDB,
  addFavoriteToDB,
  removeFavoriteFromDB,
  getFavoriteSurasFromDB,
  createSuraByAdminToDB,
  getAdminSurasFromDB,
};
