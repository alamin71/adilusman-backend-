import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Readable } from 'stream';
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

const mimeTypeToExtension: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/flac': 'flac',
};

const sanitizeFileName = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9-_\. ]/g, '')
    .trim()
    .replace(/\s+/g, '-');

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

const downloadSuraAudioFile = catchAsync(
  async (req: Request, res: Response) => {
    const suraId = req.params.suraId;
    const sura = await QuranService.getSuraDownloadInfoFromDB(suraId);

    if (!sura?.audioUrl) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Sura audio not found');
    }

    const upstreamResponse = await fetch(sura.audioUrl);

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      throw new AppError(StatusCodes.BAD_GATEWAY, 'Unable to download audio');
    }

    const mimeType =
      upstreamResponse.headers.get('content-type') ||
      sura.fileFormat ||
      'audio/mpeg';
    const extension = mimeTypeToExtension[mimeType.toLowerCase()] || 'mp3';
    const filename = `${sanitizeFileName(sura.title || 'sura')}.${extension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const stream = Readable.fromWeb(
      upstreamResponse.body as unknown as import('stream/web').ReadableStream
    );
    stream.pipe(res);
  }
);

const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const guestId =
    (typeof req.body.guestId === 'string' && req.body.guestId) ||
    (typeof req.query.guestId === 'string' && req.query.guestId) ||
    '';
  const suraId =
    (typeof req.body.suraId === 'string' && req.body.suraId) ||
    (typeof req.query.suraId === 'string' && req.query.suraId) ||
    '';

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
  downloadSuraAudioFile,
  addFavorite,
  removeFavorite,
  getFavorites,
  createSuraByAdmin,
  getAdminSuras,
};
