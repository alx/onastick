// Intervals
let photoCountdownInterval;
let btnPhotoEmojiInterval;
let btnSmileEmojiInterval;

// Show the flash light on btnPhoto emoji
let btnPhotoEmojiFlash = false;
const btnPhotoModifyEmoji = () => {
  let btnPhoto = document.getElementById("btnPhoto");
  btnPhoto.innerText = btnPhotoEmojiFlash ? "📷":"📸";
  btnPhotoEmojiFlash = !btnPhotoEmojiFlash;
}

// Rotate emoji on btnSmile button
const btnSmileEmojis = ["🥰","😄","🤩","😘"]
const btnSmileModifyEmoji = () => {
  const randomIndex = Math.floor(
    Math.random() * btnSmileEmojis.length
  );
  const selectedEmoji = btnSmileEmojis[randomIndex]
  let btnSmile = document.getElementById("btnSmile");
  btnSmile.innerText = selectedEmoji;
}

window.onload = () => {
  btnPhotoEmojiInterval = setInterval(btnPhotoModifyEmoji, 300);
  btnSmileEmojiInterval = setInterval(btnSmileModifyEmoji, 400);
}

// When clicking on btnSmile, show a grimacing face for 1s
const smileClick = () => {

  let btnSmile = document.getElementById("btnSmile");
  btnSmile.innerText = "😬";

  clearInterval(btnSmileEmojiInterval);
  setTimeout(() => {
    btnSmileEmojiInterval = setInterval(btnSmileModifyEmoji, 400);
  }, 1000)

}

// When clicking on btnProcessing, show a head exploding face for 1s
const processingClick = () => {

  let btnProcessing = document.getElementById("btnProcessing");
  btnProcessing.innerText = "🤯";

  setTimeout(() => {
    btnProcessing.innerText = "🧠";
  }, 1000)

}

const getImgSource = async (url) => {

  let img = new Image();
  img.setAttribute("crossorigin", "anonymous");
  img.src = url;

  await img.decode()

  return img;

}

const getImgBase64 = async (imgHTMLElement) => {

  let dataURL;

  try {

    let canvas = document.createElement('CANVAS');
    canvas.width = 512;
    canvas.height = 512;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(imgHTMLElement,
                  // SOURCE X, Y, WIDTH, HEIGHT
                  // 512 + 64x2 margin = 640
                  64, 0, 512, 480,
                  // DESTINATION X, Y, WIDTH, HEIGHT
                  // 512 - 480 = 32, remove 16px each side
                  0, -16, 512, 512
                 )

    dataURL = await canvas.toDataURL();

  } catch (e) {

    console.log({ e });

  }

  return new Promise(resolve => resolve(dataURL));
}

const sdApiRequest = async (inputImgBase64) => {

  const SERVER_API_ENDPOINT = "/gpu/sdapi/v1/txt2img";

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

  const response = await fetch(SERVER_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(txt2imgParams),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  const outputJson = await response.json();
  return outputJson.images[0]
}

const startCountdown = () => {

  let btnPhoto = document.getElementById("btnPhoto");
  btnPhoto.classList.add("d-none")

  let btnCountdown = document.getElementById("btnCountdown");
  btnCountdown.classList.remove("d-none")

  btnCountdown.innerText = `🕚`;
  let countdownIndex = 11;

  const countdownEmojis = [
    "🕛",
    "🕐",
    "1",
    "🕑",
    "🕒",
    "2",
    "🕓",
    "🕔",
    "3",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚"
  ]

  photoCountdownInterval = setInterval(() => {

    if (countdownIndex > -1) {

      btnCountdown.innerText = countdownEmojis[countdownIndex];
      countdownIndex--;

    } else {

      clearInterval(photoCountdownInterval);

      let btnSmile = document.getElementById("btnSmile");

      btnCountdown.classList.add("d-none")
      btnSmile.classList.remove("d-none")

      setTimeout(takePhoto, 1500)

    }

  }, 250);
}

const takePhoto = async () => {

  let imgElementTop = document.getElementById("photoStream")

  let imgElementBottom = document.getElementById("photoBottom")
  let imgElementPlaceholder = document.getElementById("photoBottomPlaceholder")
  let imgElementProcessing = document.getElementById("photoBottomProcessing")

  let btnSmile = document.getElementById("btnSmile");
  let btnCountdown = document.getElementById("btnCountdown");
  let btnError = document.getElementById("btnError");
  let btnProcessing = document.getElementById("btnProcessing");

  // Hide smile button and show progress
  btnSmile.classList.add("d-none");
  btnProcessing.classList.remove("d-none");

  let progressStep = 1;

  const progressTxt = [
    "🧠 Pixel summoning...",
    "🧠 Render requesting...",
    "🧠 Matrix negotiation...",
    "🧠 Buffer bargaining...",
    "🧠 Shader shuffling...",
    "🧠 Frame fetching...",
    "🧠 Texture tuning...",
    "🧠 Byte wrangling...",
    "🧠 Cache consulting...",
    "🧠 Algorithm arbitration..."
  ]

  const progressChangeText = () => {
    progressStep += 1;

    if (progressStep % 10 === 0) {
      const randProgressIndex = Math.floor(
        Math.random() * progressTxt.length
      )
      const randText = progressTxt[randProgressIndex]
      btnProcessing.innerHTML = randText
    }
  }
  let progressInterval = setInterval(
    progressChangeText,
    200
  )

  try {

    const CAMERA_CURRENT_URL = "/current";

    // Get source image
    const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)

    // Get base64 image
    const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
    imgElementTop.src = `data:image/png;base64,${inputImgBase64}`

    imgElementPlaceholder.classList.add("d-none")
    imgElementProcessing.classList.remove("d-none")

    // Transform source image
    const outputImgBase64 = await sdApiRequest(inputImgBase64);
    imgElementBottom.src = `data:image/png;base64,${outputImgBase64}`

    imgElementProcessing.classList.add("d-none")
    imgElementBottom.classList.remove("d-none")

    btnQrcode.classList.remove("d-none");

  } catch ({name, message}) {

    console.log("Error in takePhoto()");
    console.log(name);
    console.log(message);

    // Remove processing and show error
    btnError.classList.remove("d-none")

  } finally {

    clearInterval(progressInterval);
    btnProcessing.classList.add("d-none");

  }

}

const countdownTestClick = () => {

  let btnCountdown = document.getElementById("btnCountdown");

  btnCountdown.innerText = `🕚`;
  let countdownIndex = 11;

  const countdownEmojis = [
    "🕚",
    "🕐",
    "🕑",
    "🕒",
    "🕓",
    "🕔",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚"
  ]

  photoCountdownInterval = setInterval(() => {

    if (countdownIndex > -1) {

      btnCountdown.innerText = countdownEmojis[countdownIndex];
      countdownIndex--;

    } else {

      clearInterval(photoCountdownInterval);
      setTimeout(() => {
        btnCountdown.innerText = countdownEmojis[countdownEmojis.length - 1];
      }, 1000)

    }

  }, 200);

}

document.getElementById("btnPhoto").addEventListener("click", startCountdown, false)
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
document.getElementById("btnCountdown").addEventListener("click", countdownTestClick, false)
