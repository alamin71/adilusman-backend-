import multer from 'multer';

// Use memory storage for S3 uploads
const storage = multer.memoryStorage();

// File filter - allow multiple file types
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedImageMimes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/svg',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream',
  ];

  const allowedAudioMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/x-m4a',
    'audio/flac',
    'audio/x-flac',
    'audio/mp4',
  ];
  const allowedVideoMimes = ['video/mp4', 'video/mpeg', 'video/webm'];
  const allowedDocMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const imageFields = [
    'image',
    'thumbnail',
    'logo',
    'banner',
    'permits',
    'insurance',
    'driverLicense',
  ];
  const audioFields = ['audio'];
  const videoFields = ['video'];
  const documentFields = ['document'];

  if (imageFields.includes(file.fieldname)) {
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png, .svg, .webp format allowed!'));
    }
  } else if (audioFields.includes(file.fieldname)) {
    if (allowedAudioMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only supported audio formats are allowed (mp3, mpeg, wav, ogg, webm, aac, m4a, flac, mp4)'
        )
      );
    }
  } else if (videoFields.includes(file.fieldname)) {
    if (allowedVideoMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .mp4, .mpeg, .webm format allowed!'));
    }
  } else if (documentFields.includes(file.fieldname)) {
    if (allowedDocMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc, .docx format allowed!'));
    }
  } else {
    // Ignore unknown file fields instead of rejecting
    cb(null, false);
  }
};

// Create multer upload instance
const s3FileUploadHandler = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

export { s3FileUploadHandler };
