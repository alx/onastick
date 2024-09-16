
const getImgSource = async (url) => {

  let img = new Image();
  img.setAttribute("crossorigin", "anonymous");
  img.src = url;

  await img.decode()

  return img

}

const getImgBase64 = async (imgHTMLElement) => {

  try {

    let canvas = document.createElement('CANVAS');
    canvas.width = 512;
    canvas.height = 512;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(imgHTMLElement,
                  // SOURCE X, Y, WIDTH, HEIGHT
                  // 512 + 64x2 margin = 640
                  64, 0, 512, 480,
                  // DESTINATION X, Y, WIDTH, HEIGHT
                  // 512 - 480 = 32, remove 16px each side
                  0, -16, 512, 512
                 )

    const outputElement = document.getElementById("output")
    outputElement.appendChild(canvas);

    var dataURL = dataURL = await canvas.toDataURL();

  } catch (e) {

    console.log({ url });
    console.log({ e });

  }

  return new Promise(resolve => resolve(dataURL));
}

const sdApiRequest = async (inputImgBase64) => {

  const SERVER_API_ENDPOINT = "/sdapi/sdapi/v1/txt2img";

  const prompt = "(esoteric magicians:1.1) on an (exoplanet:1.1) point of view during sunrise, simple outlined illustration, beachy colors, <lora:sd_xl_turbo_lora_v1:1>, (dali style:1.3)";
  const negative_prompt = "text, bad art, blurry, watermark, person, tripod, letters, ugly, deformed, glasses";

  const controlNetParams = [
    {
      "batch_image_dir": "",
      "batch_input_gallery": null,
      "batch_mask_dir": "",
      "batch_mask_gallery": null,
      "control_mode": "Balanced",
      "enabled": true,
      "guidance_end": 1.0,
      "guidance_start": 0.0,
      "hr_option": "Both",
      "image": inputImgBase64,
      "mask_image": null,
      "mask_image_fg": null,
      "model": "control-lora-canny-rank128 [c910cde9]",
      "module": "canny",
      "pixel_perfect": false,
      "processor_res": 512,
      "resize_mode": "Crop and Resize",
      "save_detected_map": true,
      "threshold_a": 30,
      "threshold_b": 158,
      "use_preview_as_input": false,
      "weight": 1.2
    },
    {
      "batch_image_dir": "",
      "batch_input_gallery": null,
      "batch_mask_dir": "",
      "batch_mask_gallery": null,
      "control_mode": "Balanced",
      "enabled": true,
      "guidance_end": 1.0,
      "guidance_start": 0.0,
      "hr_option": "Both",
      "image": inputImgBase64,
      "mask_image": null,
      "mask_image_fg": null,
      "model": "thibaud_xl_openpose_256lora [14288071]",
      "module": "openpose_full",
      "pixel_perfect": false,
      "processor_res": 512,
      "resize_mode": "Crop and Resize",
      "save_detected_map": true,
      "threshold_a": 0.5,
      "threshold_b": 0.5,
      "use_preview_as_input": false,
      "weight": 1
    },
    {
      "batch_image_dir": "",
      "batch_input_gallery": null,
      "batch_mask_dir": "",
      "batch_mask_gallery": null,
      "control_mode": "Balanced",
      "enabled": true,
      "generated_image": null,
      "guidance_end": 1.0,
      "guidance_start": 0.0,
      "hr_option": "Both",
      "image": inputImgBase64,
      "mask_image": null,
      "mask_image_fg": null,
      "model": "instantIDSDXL_ipAdapterInstantId [eb2d3ec0]",
      "module": "InsightFace (InstantID)",
      "pixel_perfect": false,
      "processor_res": 0.5,
      "resize_mode": "Crop and Resize",
      "save_detected_map": true,
      "threshold_a": 0.5,
      "threshold_b": 0.5,
      "use_preview_as_input": false,
      "weight": 1.2
    }
  ];

  const txt2imgParams = {

    "prompt": prompt,
    "negative_prompt": negative_prompt,

    "width": 1024,
    "height": 1024,

    "steps": 10,
    "sampler_name": "LCM",
    "cfg_scale": 1.7,

    "override_settings": {
      "sd_model_checkpoint": "sd_xl_base_1.0_0.9vae",
      "sd_checkpoint_hash": "62b2a03e85",
    },

    "alwayson_scripts": {
      "ControlNet": {
        "args": controlNetParams
      },
      "Sampler": {
        "args": [10, "LCM", "Automatic"]
      },
    },

    "send_images": true,
    "save_images": true,
  };

  // const paramsFromUI = {
  //   "batch_size": 1,
  //   "cfg_scale": 1.7,
  //   "comments": {},
  //   "denoising_strength": 0.7,
  //   "disable_extra_networks": false,
  //   "distilled_cfg_scale": 3.5,
  //   "do_not_save_grid": false,
  //   "do_not_save_samples": false,
  //   "enable_hr": false,
  //   "height": 1024,
  //   "hr_cfg": 7,
  //   "hr_distilled_cfg": 3.5,
  //   "hr_negative_prompt": "",
  //   "hr_prompt": "",
  //   "hr_resize_x": 0,
  //   "hr_resize_y": 0,
  //   "hr_scale": 2,
  //   "hr_second_pass_steps": 0,
  //   "hr_upscaler": "Latent",
  //   "n_iter": 1,
  //   "negative_prompt": "text,bad art,blurry,watermark,person,tripod,letters,ugly,deformed,",
  //   "override_settings": {},
  //   "override_settings_restore_afterwards": true,
  //   "prompt": "a group of (esoteric magicians:1.1) on an (exoplanet:1.1) point of view during sunrise,simple outlined illustration,beachy colors,<lora:sd_xl_turbo_lora_v1:1>,(dali style:1.3),",
  //   "restore_faces": false,
  //   "s_churn": 0.0,
  //   "s_min_uncond": 0.0,
  //   "s_noise": 1.0,
  //   "s_tmax": null,
  //   "s_tmin": 0.0,
  //   "sampler_name": "LCM",
  //   "scheduler": "Automatic",
  //   "script_args": [],
  //   "script_name": null,
  //   "seed": -1,
  //   "seed_enable_extras": true,
  //   "seed_resize_from_h": -1,
  //   "seed_resize_from_w": -1,
  //   "steps": 10,
  //   "styles": [],
  //   "subseed": -1,
  //   "subseed_strength": 0,
  //   "tiling": false,
  //   "width": 1024
  // };

  const response = await fetch(SERVER_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(txt2imgParams),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  const outputJson = await response.json();
  const base64Img = outputJson.images[0]

  var image = new Image();
  image.src = `data:image/png;base64,${base64Img}`;

  return image;
}

const displayResult = (imgHTMLElement) => {

  const loadingProgressElement = document.getElementById("loadingProgress")
  loadingProgressElement.classList.add("d-none")

  const outputElement = document.getElementById("output")
  outputElement.appendChild(imgHTMLElement);

}

const startCountdown = () => {

  let btnPhoto = document.getElementById("btnPhoto");
  btnPhoto.classList.add("d-none")

  let btnCountdown = document.getElementById("btnCountdown");
  btnCountdown.classList.remove("d-none")

  let btnTxt = document.getElementById("btnTxtCountDown");
  let seconds = 3;

  btnTxt.innerText = seconds + "...";
  seconds--;

  let countdown = setInterval(() => {

    if (seconds > 0) {

      btnTxt.innerText = seconds + "...";
      seconds--;

    } else {

      clearInterval(countdown);
      btnTxt.innerText = "😄 SMILE!";

      setTimeout(takePhoto, 1000)

    }

  }, 800);
}

const nextPhoto = () => {

  let btnPhoto = document.getElementById("btnPhoto");
  let btnNext = document.getElementById("btnNext");

  btnNext.classList.add("d-none")
  btnPhoto.classList.remove("d-none")

  let divStream = document.getElementById("stream");
  divStream.classList.remove("d-none")

  let divOutput = document.getElementById("output");
  divOutput.classList.add("d-none")

  while (divOutput.hasChildNodes()) {
    divOutput.removeChild(divOutput.firstChild);
  }

}

const takePhoto = async () => {

  let btnCountdown = document.getElementById("btnCountdown");
  let btnPhoto = document.getElementById("btnPhoto");
  let btnNext = document.getElementById("btnNext");
  let loadingProgressElement = document.getElementById("loadingProgress")

  btnCountdown.classList.add("d-none");
  loadingProgressElement.classList.remove("d-none");

  let progressStep = 25;
  loadingProgressElement.attr('aria-valuenow', progressStep).css('width', progressStep);

  let progressInterval = setInterval(() => {

    if (progressStep < 100) {

      progressStep += 25;
      loadingProgressElement.attr('aria-valuenow', progressStep).css('width', progressStep);

    }

  }, 7000);

  let divStream = document.getElementById("stream");
  divStream.classList.add("d-none")

  const CAMERA_CURRENT_URL = "/current";

  const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)
  const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
  const outputImgHTMLElement = await sdApiRequest(inputImgBase64);

  displayResult(outputImgHTMLElement);
  clearInterval(progressInterval);

  // Show output div
  let divOutput = document.getElementById("output");
  divOutput.classList.remove("d-none")

  // Update action button for next photo

  btnPhoto.classList.add("d-none")
  btnNext.classList.remove("d-none")
}

document.getElementById("btnPhoto").addEventListener("click", startCountdown)
document.getElementById("btnNext").addEventListener("click", nextPhoto)

// const test = async () => {
//
//   const CAMERA_CURRENT_URL = "/current";
//
//   const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)
//   const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
// }
// document.getElementById("btnPhoto").addEventListener("click", test)
