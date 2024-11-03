// Intervals
let photoCountdownInterval;
let btnPhotoEmojiInterval;
let btnSmileEmojiInterval;

// Show the flash light on btnPhoto emoji
const btnPhotoModifyEmoji = () => {
  let btnPhotos = document.getElementsByClassName("btn-photo");
  for (var i = 0; i < btnPhotos.length; i++) {
    btnPhoto = btnPhotos.item(i)
    if(btnPhoto.innerText.indexOf("📷") === -1) {
      btnPhoto.innerText.replace("📸","📷")
    } else {
      btnPhoto.innerText.replace("📷","📸")
    }
  }
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

    let canvas = document.createElement('CANVAS');
    canvas.width = 176;
    canvas.height = 144;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0);

    // "data:image/png;base64,..."
    dataURL = await canvas.toDataURL();

  } catch (e) {

    console.log({ e });

  }

  return new Promise(resolve => resolve(dataURL));
}

const getImgBase64Resized = async (img) => {

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

const txt2imgApiRequest = async (inputImgBase64, promptSlug) => {

  console.log(promptSlug)
  const response = await fetch("/gpu/gen", {
    method: "POST",
    body: JSON.stringify({
      image: inputImgBase64.replace("data:image/png;base64,", ""),
      promptSlug: promptSlug
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  const outputJson = await response.json();
  return outputJson.image
}

const startCountdown = (event) => {

  const promptSlug = event.target.getAttribute("data-slug");
  console.log(promptSlug)

  let btnPhotos = document.getElementsByClassName("btn-photo");
  for (var i = 0; i < btnPhotos.length; i++) {
    btnPhotos.item(i).classList.add("d-none")
  }

  let btnCountdown = document.getElementById("btnCountdown");
  btnCountdown.classList.remove("d-none")

  btnCountdown.innerText = `🕚 3`;
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

      setTimeout(takePhoto(promptSlug), 1500)

    }

  }, 250);
}

const takePhoto = async (promptSlug = "") => {

  console.log(promptSlug)
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

    imgElementPlaceholder.classList.add("d-none")
    imgElementProcessing.classList.remove("d-none")

    const CAMERA_CURRENT_URL = "/current";

    // Get source image
    const sourceImgHTMLElement = await getImgSource(CAMERA_CURRENT_URL)
    const inputImgBase64 = await getImgBase64(sourceImgHTMLElement);
    console.log(inputImgBase64)

    // Get base64 image
    const resizedImgBase64 = await getImgBase64Resized(sourceImgHTMLElement);
    imgElementTop.src = resizedImgBase64
    console.log(resizedImgBase64)

    // Transform source image
    const outputImgBase64 = await txt2imgApiRequest(inputImgBase64, promptSlug);
    imgElementBottom.src = outputImgBase64;
    console.log(outputImgBase64)

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

let btnPhotos = document.getElementsByClassName("btn-photo");
for (var i = 0; i < btnPhotos.length; i++) {
  btnPhotos.item(i).addEventListener("click", startCountdown, false)
}
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
