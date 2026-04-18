import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuranService } from './quran.service';

const getGuestId = (req: Request): string => {
  const guestIdFromHeader = req.headers['x-guest-id'];

  const guestId =
    (typeof req.query.guestId === 'string' && req.query.guestId) ||
    (typeof req.body.guestId === 'string' && req.body.guestId) ||
    (typeof guestIdFromHeader === 'string' && guestIdFromHeader) ||
    '';

  return guestId.trim();
};

const getPublicReciters = catchAsync(async (req: Request, res: Response) => {
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const result = await QuranService.getPublicRecitersFromDB(search);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reciters retrieved successfully',
    data: result,
  });
});

const getPublicSuras = catchAsync(async (req: Request, res: Response) => {
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const reciterId =
    typeof req.query.reciterId === 'string'
      ? req.query.reciterId.trim()
      : undefined;
  const page = typeof req.query.page === 'string' ? req.query.page : undefined;
  const limit =
    typeof req.query.limit === 'string' ? req.query.limit : undefined;

  const result = await QuranService.getPublicSurasFromDB({
    search,
    reciterId,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Suras retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleSura = catchAsync(async (req: Request, res: Response) => {
  const suraId = req.params.suraId;
  const result = await QuranService.getSingleSuraFromDB(suraId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sura retrieved successfully',
    data: result,
  });
});

const listenSura = catchAsync(async (req: Request, res: Response) => {
  const suraId = req.params.suraId;
  const result = await QuranService.increaseListenCountInDB(suraId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sura listen count updated successfully',
    data: result,
  });
});

const downloadSura = catchAsync(async (req: Request, res: Response) => {
  const suraId = req.params.suraId;
  const result = await QuranService.increaseDownloadCountInDB(suraId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sura download count updated successfully',
    data: result,
  });
});

const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const { guestId, suraId } = req.body;
  const result = await QuranService.addFavoriteToDB(guestId, suraId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sura added to favorites',
    data: result,
  });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const suraId = req.params.suraId;
  const guestId = getGuestId(req);

  if (!guestId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'guestId is required');
  }

  await QuranService.removeFavoriteFromDB(guestId, suraId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sura removed from favorites',
    data: null,
  });
});

const getFavorites = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req);

  if (!guestId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'guestId is required');
  }

  const result = await QuranService.getFavoriteSurasFromDB(guestId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favorite suras retrieved successfully',
    data: result,
  });
});

const createSuraByAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  const files = req.files as
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  let audioFile: Express.Multer.File | undefined;
  let imageFile: Express.Multer.File | undefined;

  if (Array.isArray(files) && files.length > 0) {
    audioFile = files.find((file) => file.fieldname === 'audio');
    imageFile = files.find((file) => file.fieldname === 'image');
  } else if (files) {
    if ('audio' in files && Array.isArray(files.audio)) {
      [audioFile] = files.audio;
    }
    if ('image' in files && Array.isArray(files.image)) {
      [imageFile] = files.image;
    }
  }

  const result = await QuranService.createSuraByAdminToDB({
    title: payload.title,
    reciterId: payload.reciterId,
    reciterName: payload.reciterName,
    suraNumber: payload.suraNumber,
    durationInSeconds: payload.durationInSeconds,
    audioFile,
    reciterImageFile: imageFile,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Sura uploaded successfully',
    data: result,
  });
});

const getAdminSuras = catchAsync(async (req: Request, res: Response) => {
  const result = await QuranService.getAdminSurasFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin sura list retrieved successfully',
    data: result,
  });
});

export const QuranController = {
  getPublicReciters,
  getPublicSuras,
  getSingleSura,
  listenSura,
  downloadSura,
  addFavorite,
  removeFavorite,
  getFavorites,
  createSuraByAdmin,
  getAdminSuras,
};
