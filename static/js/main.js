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

const getImgBase64 = async (img) => {

  let dataURL;

  try {

    let canvas = document.createElement('CANVAS', {antialias: false});
    canvas.width = 1024;
    canvas.height = 1024;

    let ctx = canvas.getContext('2d');
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    const hRatio = canvas.width  / img.width    ;
    const vRatio =  canvas.height / img.height  ;
    const ratio  = Math.max ( hRatio, vRatio );
    const centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    const centerShift_y = ( canvas.height - img.height*ratio ) / 2;

    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);

    dataURL = await canvas.toDataURL();

  } catch (e) {

    console.log({ e });

  }

  return new Promise(resolve => resolve(dataURL));
}

const interrogatorApiRequest = async (inputImgBase64) => {

  const SERVER_API_ENDPOINT = "/gpu/interrogator/prompt";

  const interrogatorParams = {
    "image": inputImgBase64,
    "clip_model_name": "RN50/openai",
    "mode": "fast"
  }

  console.log(interrogatorParams)

  const response = await fetch(SERVER_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(interrogatorParams),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  const outputJson = await response.json();
  console.log(outputJson)
  const response_prompt = outputJson["prompt"]

  let result = "";

  // return first result from list
  if(response_prompt.indexOf("Exception") === -1) {
    result = response_prompt.split(',')[0]
  }

  return result;
}

const txt2imgApiRequest = async (inputImgBase64) => {

  const SERVER_API_ENDPOINT = "/gpu/sdapi/v1/txt2img";

  const interrogator_prompt = await interrogatorApiRequest(inputImgBase64)

  const prompt = interrogator_prompt + ", A black and white vintage, timeworn family photograph from 1890, rural clothing, ultra-detailed, 8k, slightly sepia tone";
  const negative_prompt = "text, bad art, blurry, watermark, person, tripod, letters, ugly, deformed, glasses";

  const controlNetParams = [
    {
      "batch_image_dir": "",
      "batch_input_gallery": null,
      "batch_mask_dir": "",
      "batch_mask_gallery": null,
      "control_mode": "Balanced",
      "enabled": true,
      "guidance_end": 0.8,
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
      "threshold_a": 100,
      "threshold_b": 200,
      "use_preview_as_input": false,
      "weight": 1.2
    }
  ];

  const txt2imgParams = {

    "prompt": prompt,
    "negative_prompt": negative_prompt,

    "restore_faces": false,

    "width": 896,
    "height": 1152,

    "steps": 8,
    "sampler_name": "DPM++ SDE",
    "cfg_scale": 5,

    "override_settings": {
      "sd_model_checkpoint": "sd_xl_base_1.0_0.9vae",
      "sd_checkpoint_hash": "62b2a03e85",
    },

    "alwayson_scripts": {
      "ControlNet": {
        "args": controlNetParams
      },
      "Sampler": {
        "args": [8, "DPM++ SDE", "Karras"]
      },
      "reactor": {
        "args": [
          inputImgBase64,
          true,
          '0,1,2,3', '0,1,2,3',
          'inswapper_128.onnx', 'CodeFormer',
          1, true, 'None', 2, 1, true, true, 2, 0, 0, false, 1, true, true,
          'CUDA', false, 0, null
        ]
      }
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
    "🕛 1",
    "🕐 1",
    "🕑 1",
    "🕒 1",
    "🕓 2",
    "🕔 2",
    "🕕 2",
    "🕖 2",
    "🕗 3",
    "🕘 3",
    "🕙 3",
    "🕚 3"
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
    600
  )

  try {

    const CAMERA_CURRENT_URL = "/current";

    // Get source image
    const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)

    // Get base64 image
    const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
    imgElementTop.src = inputImgBase64

    imgElementPlaceholder.classList.add("d-none")
    imgElementProcessing.classList.remove("d-none")

    // Transform source image
    const outputImgBase64 = await txt2imgApiRequest(inputImgBase64);
    imgElementBottom.src = `data:image/png;base64,${outputImgBase64}`

    imgElementProcessing.classList.add("d-none")
    imgElementBottom.classList.remove("d-none")

  } catch ({name, message}) {

    console.log("Error in takePhoto()");
    console.log(name);
    console.log(message);

    // Remove processing and show error
    btnError.classList.remove("d-none")

  } finally {

    clearInterval(progressInterval);
    btnProcessing.classList.add("d-none");
    btnQrcode.classList.remove("d-none");

  }

}

document.getElementById("btnPhoto").addEventListener("click", startCountdown, false)
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
