import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
import { s3FileUploadHandler } from '../../middleware/s3FileUploadHandler';
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

router.post(
  '/admin/suras',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  s3FileUploadHandler.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  validateRequest(QuranValidation.createSuraZodSchema),
  QuranController.createSuraByAdmin
);

router.get(
  '/admin/suras',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  QuranController.getAdminSuras
);

export const QuranRoutes = router;
