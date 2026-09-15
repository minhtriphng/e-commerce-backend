import { applyDecorators } from '@nestjs/common';
import { Matches, IsString } from 'class-validator';

export function IsAlphaOnly(message?: string) {
  return applyDecorators(
    IsString(),
    Matches(
      /^[a-zA-Zàáảãạăâầấẩẫậắằẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s]+$/,
      {
        message:
          message ||
          'Chỉ được chứa chữ cái (bao gồm tiếng Việt có dấu) và khoảng trắng',
      },
    ),
  );
}
