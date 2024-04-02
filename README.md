# Azure Function - Apply Watermark - Example

This is a sample project of an Azure Function that applies a
watermark to an image using the [Sharp library](https://github.com/lovell/sharp).

## How to run locally

First, clone this repository using the following command:

```bash
git clone <url>
```

Then, install dependencies and run the project:

```bash
npm i
npm start
```

To test the API:

```bash
curl -X POST \
  -F "image=@./image.jpg" \
  -F "watermarkText=consolelog.com.br" \
  -o result.jpg \
  http://localhost:7071/api/applyWatermark
```

---

This repository is used as an example on my blog. The text
is originally written in portuguese: [link](https://consolelog.com.br/o-que-e-serverless-exemplo-azure-functions-typescript)