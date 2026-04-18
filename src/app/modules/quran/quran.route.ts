import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { QuranController } from './quran.controller';
import { QuranValidation } from './quran.validation';

const router = express.Router();

router.get(
  '/reciters',
  validateRequest(QuranValidation.paginationQueryZodSchema),
  QuranController.getPublicReciters
);

router.get(
  '/suras',
  validateRequest(QuranValidation.paginationQueryZodSchema),
  QuranController.getPublicSuras
);

router.get('/suras/:suraId', QuranController.getSingleSura);
router.post('/suras/:suraId/listen', QuranController.listenSura);
router.post('/suras/:suraId/download', QuranController.downloadSura);
router.get(
  '/suras/:suraId/audio-download',
  QuranController.downloadSuraAudioFile
);

router.get(
  '/favorites',
  validateRequest(QuranValidation.getFavoritesZodSchema),
  QuranController.getFavorites
);

router.post(
  '/favorites',
  validateRequest(QuranValidation.addFavoriteZodSchema),
  QuranController.addFavorite
);

router.delete('/favorites/:suraId', QuranController.removeFavorite);

export const QuranRoutes = router;
