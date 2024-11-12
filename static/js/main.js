// Intervals
let photoCountdownInterval;
let btnPhotoEmojiInterval;
let btnSmileEmojiInterval;
let btnRefreshInterval;

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
    canvas.width = 960;
    canvas.height = 720;
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

const txt2imgApiRequest = async (promptSlug, base64Str) => {

  // Create File obj with base64Str content
  // from /webcam_capture endpoint
  const captureImg = new File(
    [Uint8Array.from(atob(base64Str), (m) => m.codePointAt(0))],
    'capture.jpg',
    { type: "image/jpg" }
  );

  // Set form parameters: image and prompt
  let formData = new FormData();
  formData.append("prompt", promptSlug)
  formData.append("image", captureImg)

  // request api-call-matrix flask server
  const apiResponseImage = await fetch("/gpu/gen", {
    method: "POST",
    body: formData
  })

  const imageBlob = await apiResponseImage.blob();
  return URL.createObjectURL(imageBlob);
}

const startCountdown = (event) => {

  const promptSlug = event.target.getAttribute("data-slug");
  let imgElementTop = document.getElementById("photoStream")

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

  photoCountdownInterval = setInterval(async () => {

    if (countdownIndex > -1) {

      if (countdownIndex === 11) {
        document.getElementById("photoStream").classList.add("d-none");
        document.getElementById("countdown3").classList.remove("d-none");
      } else if (countdownIndex === 7) {
        document.getElementById("countdown3").classList.add("d-none");
        document.getElementById("countdown2").classList.remove("d-none");
      } else if (countdownIndex === 3) {
        document.getElementById("countdown2").classList.add("d-none");
        document.getElementById("countdown1").classList.remove("d-none");
      }

      btnCountdown.innerText = countdownEmojis[countdownIndex];
      countdownIndex--;

    } else {

      document.getElementById("countdown1").classList.add("d-none");
      document.getElementById("countdownSmile").classList.remove("d-none");

      clearInterval(photoCountdownInterval);

      let btnSmile = document.getElementById("btnSmile");

      btnCountdown.classList.add("d-none");
      btnSmile.classList.remove("d-none");

      const capture = await fetch("/webcam_capture");
      const base64Str = await capture.text();

      // Replace top image with capture
      document.getElementById("countdownSmile").classList.add("d-none");
      const base64Img = "data:image/png;base64," + base64Str;
      imgElementTop.src = base64Img;
      imgElementTop.classList.remove("d-none");

      setTimeout(takePhoto(promptSlug, base64Str), 1500);

    }

  }, 250);
}

const takePhoto = async (promptSlug, base64Str) => {

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
    300
  )

  try {
    imgElementPlaceholder.classList.add("d-none")
    imgElementProcessing.classList.remove("d-none")

    imgElementBottom.src = await txt2imgApiRequest(promptSlug, base64Str);

    imgElementProcessing.classList.add("d-none")
    imgElementBottom.classList.remove("d-none")

    document.getElementById("btnActionKeep").classList.remove("d-none")
    document.getElementById("btnActionDelete").classList.remove("d-none")

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

const btnRefreshEmoji = () => {
  let actionRunEmoji = document.getElementById("actionRunPublish");

  if(actionRunEmoji.innerText == "🔄") {
    actionRunEmoji.innerText = "🔃"
  } else {
    actionRunEmoji.innerText = "🔄"
  }

}

const actionKeepClick = async (e) => {

  const btnAction = e.target;

  const actionInitEmoji = btnAction.querySelector("#actionInitPublish");
  actionInitEmoji.classList.add("d-none")

  const actionRunEmoji = btnAction.querySelector("#actionRunPublish");
  actionRunEmoji.classList.remove("d-none")

  btnRefreshInterval = setInterval(btnRefreshEmoji, 200);

  const imgElementTop = document.getElementById("photoStream")
  const qrcodeElement = document.getElementById("qrcode")

  const keepResponse = await fetch("/gpu/keep");
  const imgUrl = await keepResponse.text();

  const config = {
    "length": 500,
    "padding": 20,
    "value": imgUrl,
    "errorCorrectionLevel": "H",
    "logo": {
      "url": "",
      "size": 9,
      "removeBg": false
    },
    "shapes": {
      "eyeFrame": "body",
      "body": "square",
      "eyeball": "body"
    },
    "colors": {
      "background": "transparent",
      "body": "rgb(1, 1, 1)",
      "eyeFrame": {
        "topLeft": "body",
        "topRight": "body",
        "bottomLeft": "body"
      },
      "eyeball": {
        "topLeft": "rgb(9, 91, 241)",
        "topRight": "rgb(9, 91, 241)",
        "bottomLeft": "rgb(9, 91, 241)"
      }
    }
  }
  const svgString = window.qrcode.generateSVGString(config);
  qrcodeElement.innerHTML = svgString;

  imgElementTop.classList.add('d-none')
  qrcodeElement.classList.remove('d-none')

  // Change action button layout
  document.getElementById("btnActionKeep").classList.add("d-none")
  document.getElementById("btnActionDelete").classList.add("d-none")
  document.getElementById("btnActionRefresh").classList.remove("d-none")

  clearInterval(btnRefreshInterval);
}

let btnPhotos = document.getElementsByClassName("btn-photo");
for (var i = 0; i < btnPhotos.length; i++) {
  btnPhotos.item(i).addEventListener("click", startCountdown, false)
}
document.getElementById("btnSmile").addEventListener("click", smileClick, false)
document.getElementById("btnProcessing").addEventListener("click", processingClick, false)
document.getElementById("btnActionKeep").addEventListener("click", actionKeepClick, false)
