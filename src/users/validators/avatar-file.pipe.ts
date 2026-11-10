import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export const avatarFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: AVATAR_MAX_SIZE }),
    new FileTypeValidator({ fileType: /^image\/(jpg|jpeg|png|webp)$/ }),
  ],
});