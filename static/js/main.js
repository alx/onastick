async function getImgBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const bmp = await createImageBitmap(blob);

      var canvas = document.createElement('CANVAS');
      canvas.width = 800;
      canvas.height = 600;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(bmp, 0, 0);
      var dataURL = dataURL = await canvas.toDataURL();
    }
    catch (e) {
        console.log({ url });
        console.log({ e });
    }

    //Return
    return new Promise(resolve => resolve(dataURL));
}

async function takePhoto() {

  const SERVER_URL = "http://127.0.0.1:7860";
  const SERVER_API_ENDPOINT = "/sdapi/v1/txt2img";

  // const CAMERA_CURRENT_URL = "http://192.168.8.178:8081/101/current";
  const CAMERA_CURRENT_URL = "/test.jpg";

  const prompt = "a group of (esoteric magicians:1.1) on an (exoplanet:1.1) point of view during sunrise, simple outlined illustration, beachy colors, <lora:sd_xl_turbo_lora_v1:1>, (dali style:1.3)";
  const negative_prompt = "text, bad art, blurry, watermark, person, tripod, letters, ugly, deformed, glasses"

  const inputImage = await getImgBase64(CAMERA_CURRENT_URL);

  const controlNetParams = [
    {
      "enabled": true,
      "input_image": inputImage,
      "model": "controlnet-canny-sdxl-1.0 [7b2ce256]",
      "module": "canny",
      "weight": 1.1
    }
  ];

  const txt2imgParams = {

    "prompt": prompt,
    "negative_prompt": negative_prompt,

    "width": 1024,
    "height": 1024,

    "steps": 4,
    "sampler_name": "LCM",
    "cfg_scale": 1.5,

    "override_settings": {
      "sd_model_checkpoint": "sd_xl_base_1.0_0.9vae",
      "sd_checkpoint_hash": "62b2a03e85",
    },

    "alwayson_scripts": {
      "controlnet": {
        "args": controlNetParams
      }
    },

    "send_images": true,
    "save_images": true,
  };

  fetch(`${SERVER_URL}${SERVER_API_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(txt2imgParams),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => response.json())
  .then((json) => {
    console.log(json)

    const base64Img = json.images[0]

    var image = new Image();
    image.src = `data:image/png;base64,${base64Img}`;

    document.body.appendChild(image);
  });

}
