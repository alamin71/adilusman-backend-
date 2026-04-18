import { z } from 'zod';

const paginationQueryZodSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    reciterId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const getFavoritesZodSchema = z.object({
  query: z.object({
    guestId: z.string().min(3, 'guestId is required'),
  }),
});

const addFavoriteZodSchema = z.object({
  body: z.object({
    guestId: z.string().min(3, 'guestId is required'),
    suraId: z.string().min(1, 'suraId is required'),
  }),
});

const createSuraZodSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'title is required'),
      reciterId: z.string().optional(),
      reciterName: z.string().optional(),
      suraNumber: z.string().optional(),
      durationInSeconds: z.string().optional(),
    })
    .refine((data) => data.reciterId || data.reciterName, {
      message: 'Either reciterId or reciterName is required',
      path: ['reciterName'],
    }),
});

export const QuranValidation = {
  paginationQueryZodSchema,
  getFavoritesZodSchema,
  addFavoriteZodSchema,
  createSuraZodSchema,
};
