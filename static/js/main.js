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
  const base64Img = outputJson.images[0]

  var image = new Image();
  image.src = `data:image/png;base64,${base64Img}`;

  return image;
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

      let btnSmile = document.getElementById("btnSmile");

      btnCountdown.classList.add("d-none")
      btnSmile.classList.remove("d-none")

      setTimeout(takePhoto, 1500)

    }

  }, 250);
}

const nextPhoto = () => {

  let btnPhoto = document.getElementById("btnPhoto");
  let btnError = document.getElementById("btnError");
  let btnNext = document.getElementById("btnNext");

  let divStream = document.getElementById("stream");
  let divOutput = document.getElementById("output");

  btnNext.classList.add("d-none")
  btnPhoto.classList.remove("d-none")

  divOutput.classList.add("d-none")
  divStream.classList.remove("d-none")

}

const takePhoto = async () => {

  let btnSmile = document.getElementById("btnSmile");
  let btnCountdown = document.getElementById("btnCountdown");
  let btnError = document.getElementById("btnError");
  let btnNext = document.getElementById("btnNext");
  let btnProcessing = document.getElementById("btnProcessing");

  let loadingProgressElement = document.getElementById("loadingProgress")
  let loadingProgressBarElement = document.getElementById("loadingProgressBar")

  let resultSrcElement = document.getElementById("resultSrc")
  let resultOutputElement = document.getElementById("resultOutput")

  // Hide Stream
  let divStream = document.getElementById("stream");
  divStream.classList.add("d-none")

  // Prepare results
  resultSrcElement.replaceChildren();
  resultOutputElement.replaceChildren();
  resultOutputElement.classList.remove("col");

  // Hide smile button and show progress
  btnSmile.classList.add("d-none");
  btnProcessing.classList.remove("d-none");
  loadingProgressElement.classList.remove("d-none");

  let progressStep = 1;
  loadingProgressBarElement.style.width = `${progressStep}%`

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

  let progressInterval = setInterval(() => {

    if (progressStep < 100) {

      progressStep += 1;
      loadingProgressBarElement.style.width = `${progressStep}%`

      if (progressStep % 10 === 0) {
        const selectedTxt = progressTxt[Math.floor(Math.random() * progressTxt.length)]
        loadingProgressBarElement.innerHTML = selectedTxt
      }

    } else {

      clearInterval(progressInterval);

    }

  }, 300);

  try {

    const CAMERA_CURRENT_URL = "/current";

    // Get source image
    const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)
    sourceImgHTMLElement.classList.add("img-fluid");
    resultSrcElement.appendChild(sourceImgHTMLElement);

    // Transform source image
    const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
    const outputImgHTMLElement = await sdApiRequest(inputImgBase64);

    // Display transformed image
    outputImgHTMLElement.classList.add("img-fluid");
    resultOutputElement.appendChild(outputImgHTMLElement);

    // Remove processing and show next
    btnProcessing.classList.add("d-none");
    loadingProgressElement.classList.add("d-none");
    btnNext.classList.remove("d-none")

  } catch ({name, message}) {

    console.log("Error in takePhoto()");
    console.log(name);
    console.log(message);

    // Remove processing and show error
    btnProcessing.classList.add("d-none");
    loadingProgressElement.classList.add("d-none");
    btnError.classList.remove("d-none")
    divStream.classList.remove("d-none")

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
document.getElementById("btnNext").addEventListener("click", nextPhoto, false)
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
document.getElementById("btnCountdown").addEventListener("click", countdownTestClick, false)
