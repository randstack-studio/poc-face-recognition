import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");
const faceMatchResult = document.getElementById("face_match_result");
const faceMatchBox = document.getElementById("face_match_box");
const milestone = document.getElementById("milestone");
const resetButton = document.getElementById("reset_button");
const galleryModal = new bootstrap.Modal(
  document.getElementById("submittedModal"),
  {
    keyboard: false,
    backdrop: "static",
  }
);
const milestoneTypes = new Array(
  {
    id: 1,
    name: "Eye Blink",
    landmark: ["eyeBlinkLeft", "eyeBlinkRight"],
    label: "Kedipkan Mata",
    threshold: 0.5,
    status: false,
    message: "Blink detected",
  },
  {
    id: 2,
    name: "Eye Squint",
    landmark: ["eyeSquintLeft", "eyeSquintRight"],
    label: "Tengok Kanan / Kiri",
    threshold: 0.5,
    status: false,
    message: "Squint detected",
  },
  {
    id: 3,
    name: "Open Jaw",
    landmark: ["jawOpen"],
    label: "Buka Mulut",
    threshold: 0.75,
    status: false,
    message: "Jaw Open detected",
  },
  {
    id: 4,
    name: "Smile",
    landmark: ["mouthSmileLeft", "mouthSmileRight"],
    label: "Senyum",
    threshold: 0.9,
    status: false,
    message: "Smile detected",
  },
  {
    id: 5,
    name: "Pucker",
    landmark: ["mouthPucker"],
    label: "Manyunkan Mulut",
    threshold: 0.98,
    status: false,
    message: "Pucker detected",
  },
  {
    id: 6,
    name: "Brow Raise",
    landmark: ["browInnerUp"],
    label: "Naikan Alis",
    threshold: 0.9,
    status: false,
    message: "Pucker detected",
  }
);

let milestoneSelected = [];
let timer = document.getElementById("timer");
let timerBox = document.getElementById("timer_box");
let timeout = document.getElementById("timeout");
let timerTimeout = document.getElementById("timer_timeout");
let captured = document.getElementById("captured");
let boxCapture = document.getElementById("box-capture");
let container = document.getElementById("container");
let instruction = document.getElementById("instruction");
let validateLoading = document.getElementById("validate_loading");
let capturedFrame = null;
let synced = false;
let faceLandmarker;
let runningMode = "VIDEO";
let enableWebcamButton;
let webcamRunning;
let mediaStream = null;
let timeoutIn = null;
const videoWidth = 480;

// const socket = io("http://127.0.0.1:8086", {
//   transports: ["websocket"], // Use WebSocket transport
//   withCredentials: true,
// });

const socket = io("lens.staging.endavolabs.com", {
  transports: ["polling"], // Use WebSocket transport
  withCredentials: true,
});

socket.on("biometricLoginResult", (response) => {
  console.log(response);
  if (response.success) {
    email.value = response.result.email;
    form.submit();
  } else {
    validateLoading.classList.add("hidden");
    faceMatchBox.classList.remove("hidden");
    milestone.classList.add("hidden");
    faceMatchResult.innerHTML = response.message;
    resetButton.classList.remove("hidden");
    galleryModal.hide();
  }
});

function startTimer() {
  let count = 3;
  let interval = setInterval(() => {
    count--;
    timer.innerHTML = count;
    if (count == 0) {
      capture();
      let ids = [];
      for (let i = 1; i <= 3; i++) {
        let id = Math.floor(Math.random() * milestoneTypes.length) + 1;
        while (ids.includes(id)) {
          id = Math.floor(Math.random() * milestoneTypes.length) + 1;
        }
        ids.push(id);
      }

      milestoneSelected = [
        {
          ...milestoneTypes.find((mls) => mls.id == ids[0]),
          order: 1,
          seconds: Math.floor(Math.random() * 3) + 1,
        },
        {
          ...milestoneTypes.find((mls) => mls.id == ids[1]),
          order: 2,
          seconds: Math.floor(Math.random() * 3) + 1,
        },
        {
          ...milestoneTypes.find((mls) => mls.id == ids[2]),
          order: 3,
          seconds: Math.floor(Math.random() * 3) + 1,
        },
      ];

      startTimeout();
      milestone.innerHTML = `
      <p class='p-red text-center text-lg' id="mls-${ids[0]}">${
        "1. " +
        milestoneSelected.find((mls) => mls.id == ids[0]).label +
        " (" +
        milestoneSelected.find((mls) => mls.id == ids[0]).seconds +
        " detik)"
      }</p>
      <p class='p-red text-center text-lg' id="mls-${ids[1]}">${
        "2. " +
        milestoneSelected.find((mls) => mls.id == ids[1]).label +
        " (" +
        milestoneSelected.find((mls) => mls.id == ids[1]).seconds +
        " detik)"
      }</p>
      <p class='p-red text-center text-lg' id="mls-${ids[2]}">${
        "3. " +
        milestoneSelected.find((mls) => mls.id == ids[2]).label +
        " (" +
        milestoneSelected.find((mls) => mls.id == ids[2]).seconds +
        " detik)"
      }</p>`;
      milestone.classList.remove("hidden");
      clearInterval(interval);
      timerBox.classList.add("hidden");
      // startVideo();
      // capture();
    }
  }, 1000);
}

function startTimeout() {
  let count = 15;
  timerTimeout.classList.remove("hidden");
  timeoutIn = setInterval(() => {
    count--;
    timeout.innerHTML = count;
    if (count == 0) {
      window.location.reload();
    }
  }, 1000);
}
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    },
    delegate: "GPU",
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
    minFaceDetectionConfidence: 0.96,
    minFacePresenceConfidence: 0.96,
    minTrackingConfidence: 0.96,
  });
  demosSection.classList.remove("invisible");
  enableCam();
}
createFaceLandmarker();

const imageContainers = document.getElementsByClassName("detectOnClick");

// Now let's go through all of these and add a click event listener.
for (let imageContainer of imageContainers) {
  // Add event listener to the child element whichis the img element.
  imageContainer.children[0].addEventListener("click", handleClick);
}

// When an image is clicked, let's detect it and display results!
async function handleClick(event) {
  if (!faceLandmarker) {
    console.log("Wait for faceLandmarker to load before clicking!");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await faceLandmarker.setOptions({ runningMode });
  }
  // Remove all landmarks drawed before
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  // We can call faceLandmarker.detect as many times as we like with
  // different image data each time. This returns a promise
  // which we wait to complete and then call a function to
  // print out the results of the prediction.
  const faceLandmarkerResult = faceLandmarker.detect(event.target);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.width = `${event.target.width}px`;
  canvas.style.height = `${event.target.height}px`;

  event.target.parentNode.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmarks of faceLandmarkerResult.faceLandmarks) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0",
    });
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }
  drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
}

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");

const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
// if (hasGetUserMedia()) {
//   enableWebcamButton = document.getElementById(
//     "webcamButton"
//   );
//   enableWebcamButton.addEventListener("click", enableCam);
// } else {
//   console.warn("getUserMedia() is not supported by your browser");
// }

// Enable the live webcam view and start detection.
function enableCam() {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    // enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    // enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    mediaStream = stream;
    startTimer();
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let order = 0;
let timestamp = null;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);
async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
  }
  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
async function capture() {
  // console.log("CAPTURED")
  const empty = document.getElementById("empty");
  const track = mediaStream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);

  capturedFrame = await imageCapture.takePhoto();
  captured.src = URL.createObjectURL(capturedFrame);
}

async function sync() {
  clearInterval(timeoutIn);
  boxCapture.classList.remove("hidden");
  container.classList.add("hidden");
  instruction.classList.add("hidden");
  galleryModal.show();
  validateLoading.classList.remove("hidden");
  const blob = capturedFrame.slice(0, capturedFrame.size, "image/png"); // Adjust the format if needed
  const capturedFile = new File([blob], "captured_image.png", {
    type: "image/png",
  });
  const currentEmail = localStorage.getItem("email");
  socket.emit("biometricLogin", {
    capturedFile: capturedFile,
    email: currentEmail,
  });
  // sendSocketLogin(capturedFile);
}

function drawBlendShapes(el, blendShapes) {
  if (!blendShapes.length) {
    return;
  }

  // console.log(blendShapes[0]);

  let htmlMaker = "";
  blendShapes[0].categories.map((shape) => {
    // milestoneSelected.map((mls) => {
    //   if (mls.landmark.includes(shape.categoryName)) {

    //   }
    // });
    if (milestoneSelected.length > 0) {
      if (milestoneSelected[order].landmark.includes(shape.categoryName)) {
        if (shape.score > milestoneSelected[order].threshold) {
          if (timestamp === null) {
            timestamp = Date.now(); // Catat waktu awal senyum
          } else {
            const currentTime = Date.now();
            const smileDuration = currentTime - timestamp;

            if (smileDuration >= milestoneSelected[order].seconds * 1000) {
              milestoneSelected[order].status = true;
              let el = document.getElementById(
                `mls-${milestoneSelected[order].id}`
              );
              el.classList.remove("p-red");
              el.classList.add("p-green");
              timestamp = null;
              if (order < 2) {
                order += 1;
              }
            }
          }
        }
      }
      if (milestoneSelected.every((mls) => mls.status == true)) {
        if (synced == false) {
          sync();
          synced = true;
        }
      }
    }
    htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${
          shape.displayName || shape.categoryName
        }</span>
        <span class="blend-shapes-value" style="width: calc(${
          +shape.score * 100
        }% - 120px)">${(+shape.score).toFixed(4)}</span>
      </li>
    `;
  });

  el.innerHTML = htmlMaker;
}
