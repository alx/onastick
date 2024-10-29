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

    // "data:image/png;base64,..."
    dataURL = await canvas.toDataURL();

  } catch (e) {

    console.log({ e });

  }

  return new Promise(resolve => resolve(dataURL));
}

const txt2imgApiRequest = async (inputImgBase64) => {

  const response = await fetch("/gpu/gen", {
    method: "POST",
    body: JSON.stringify({
      image: inputImgBase64.replace("data:image/png;base64,", "")
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  const outputJson = await response.json();
  return outputJson.image
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
    imgElementBottom.src = outputImgBase64;

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

    // Next workflow step
    // btnQrcode.classList.remove("d-none");

  }

}

document.getElementById("btnPhoto").addEventListener("click", startCountdown, false)
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
