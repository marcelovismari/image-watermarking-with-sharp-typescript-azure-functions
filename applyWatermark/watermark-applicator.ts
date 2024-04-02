import * as sharp from 'sharp';
import { OverlayOptions } from 'sharp';

export class WatermarkApplicator {
  objSourceImg: sharp.Sharp;

  constructor(
    sourceImg: Buffer,
    private logInfo: (...args: any) => void,
    private logError: (...args: any) => void
  ) {
    try {
      this.objSourceImg = sharp(sourceImg);
    } catch (error) {
      this.logError('Error creating Sharp object', error);
      throw error;
    }
  }

  async getDimensions(): Promise<{
    width: number;
    height: number;
  }> {
    try {
      const imgMetadata = await this.objSourceImg.metadata();
      return {
        width: imgMetadata.width ?? 100,
        height: imgMetadata.height ?? 100,
      };
    } catch (error) {
      this.logError('Error fetching metadata', error);
      throw error;
    }
  }

  async createWaterMark(
    text: string,
    textWidth: number
  ): Promise<Buffer> {
    return sharp({
      text: {
        // Suporte a Pango markup. Exemplo:
        // text: `<span foreground="#fff">${text}</span>`,
        text: `${text}`,
        rgba: true,
        align: 'center',
        justify: true,
        width: Math.round(textWidth * 0.2),
        dpi: 200,
      },
    })
      .rotate(45, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ palette: true })
      .toBuffer();
  }

  async apply(text: string) {
    try {
      this.logInfo(`Applying text: ${text}`);

      const { width, height } = await this.getDimensions();
      this.logInfo(`Dimensions: ${width} x ${height}`);

      const objWaterMark = await this.createWaterMark(
        text,
        width
      );

      this.logInfo('Sharp object with watermark created');

      const twentyPercent = 0.2;
      const marginX = width * twentyPercent;
      const marginY = height * twentyPercent;

      const layers: OverlayOptions[] = [];
      for (let x = 0; x < width; x += marginX) {
        for (let y = 0; y < height; y += marginY) {
          layers.push({
            input: objWaterMark,
            top: Math.round(y),
            left: Math.round(x),
          });
        }
      }

      this.logInfo(`Applying ${layers.length} watermarks`);

      return this.objSourceImg
        .composite(layers)
        .jpeg()
        .toBuffer();
    } catch (error) {
      this.logError('Error applying watermark', error);
      throw error;
    }
  }
}
