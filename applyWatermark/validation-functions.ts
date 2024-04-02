import { HttpRequest, FormPart } from '@azure/functions';

export function isMultiPartFormData(req: HttpRequest) {
  const contentType = req.headers['content-type'];
  return contentType.indexOf('multipart/form-data') >= 0;
}

export function validateAndFetchImageFieldErrors(
  formField: FormPart | null
): string {
  if (!formField) {
    return '"image" was not found in the body';
  }

  const supportedTypes = ['image/png', 'image/jpeg'];
  if (!supportedTypes.includes(formField.contentType || '')) {
    return `Unsupported image type. Supported types are: ${supportedTypes.join(
      ', '
    )}`;
  }

  const image = formField.value;
  if (image.length === 0) {
    return 'Image size must be greater than zero';
  }

  return '';
}

export function validateAndFetchTextFieldErrors(
  formField: FormPart | null
): string {
  if (!formField) {
    return '"watermarkText" was not found in the body';
  }

  const value = formField?.value.toString('utf8');

  if (
    typeof value !== 'string' ||
    !(value.length >= 1 && value.length <= 20)
  ) {
    return `"watermarkText" must be between 1 and 20 characters`;
  }

  return '';
}
