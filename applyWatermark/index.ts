import {
  AzureFunction,
  Context,
  HttpRequest,
} from '@azure/functions';

import { HttpStatusCode } from './http-status-code';
import {
  isMultiPartFormData,
  validateAndFetchImageFieldErrors,
  validateAndFetchTextFieldErrors,
} from './validation-functions';
import { WatermarkApplicator } from './watermark-applicator';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (!isMultiPartFormData(req)) {
    context.res = {
      status: HttpStatusCode.UnsupportedMediaType,
      body: 'Supports only multipart/form-data',
    };

    return;
  }

  try {
    // *****************************************************
    // * Validations
    // *****************************************************
    const form = req.parseFormBody();
    const formImage = form.get('image');
    const formWatermarkText = form.get('watermarkText');

    const validationErrors = [
      validateAndFetchImageFieldErrors(formImage),
      validateAndFetchTextFieldErrors(formWatermarkText),
    ].filter(Boolean);

    if (validationErrors.length) {
      context.log(validationErrors);
      context.res = {
        status: HttpStatusCode.BadRequest,
        body: validationErrors.join('\n'),
      };

      return;
    }

    const imgBuffer = formImage!.value;
    const text = formWatermarkText!.value.toString('utf-8');

    // *****************************************************
    // * Processing Start
    // *****************************************************
    const imageProcessor = new WatermarkApplicator(
      imgBuffer,
      (...args: any) => context.log(args),
      (...args: any) => context.log.error(args)
    );

    const imageWithWatermark = await imageProcessor.apply(text);

    context.res = {
      status: HttpStatusCode.Ok,
      body: imageWithWatermark,
      headers: {
        'Content-Type': 'image/jpg',
        'Content-Length': imageWithWatermark.length,
      },
    };
  } catch (error) {
    context.log.error('Error applying watermark', error);

    context.res = {
      status: HttpStatusCode.InternalServerError,
      body: 'An internal error occurred.',
    };
  }
};

export default httpTrigger;
