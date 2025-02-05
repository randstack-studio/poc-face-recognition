"use strict";
require("@tensorflow/tfjs");
require("@tensorflow/tfjs-core");
require("@tensorflow/tfjs-node");
const axios = require("axios");
const cv = require("opencv4nodejs");
const Helpers = use("Helpers");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const io = require("socket.io");
const UserFace = use("App/Models/UserFace");
const User = use("App/Models/User");
const UserInformation = use("App/Models/UserInformation");
const AttendanceHistory = use("App/Models/AttendanceHistory");
const { Canvas, Image, ImageData } = canvas;
class FaceRecognitionController {
  async faceDetection({ request, response }) {
    try {
      // Construct the path to the file in the public folder
      const filePath = Helpers.publicPath(`ktp.png`);
      const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
      const image = await cv.imreadAsync(filePath);
      const faces = classifier.detectMultiScale(image);
      faces.objects.forEach((faceRect) => {
        const { x, y, width, height } = faceRect;
        image.drawRectangle(
          new cv.Rect(x, y, width, height),
          new cv.Vec(0, 255, 0),
          2
        );
      });

      // Save the marked image to a temporary file
      const markedImagePath = Helpers.publicPath(
        `marked_${path.basename(filePath)}`
      );
      await cv.imwriteAsync(markedImagePath, image);
      return response.status(200).json({ markedImagePath });
      // cv.imreadAsync(filePath, (err, img) => {
      //     if (err) { return console.error(err); }
      //     const grayImg = img.bgrToGray();
      //     classifier.detectMultiScaleAsync(grayImg, (err, res) => {
      //         if (err) { return console.error(err); }
      //         const { objects, numDetections } = res;
      //         console.log(objects, numDetections);
      //     });
      // })
      // Check if the file exists
      // if (!fs.existsSync(filePath)) {
      //     return response.status(404).json({ message: 'File not found' })
      // }

      // // Send the file as a response
      // return response.download(filePath)
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error" });
    }
    //
    //    cv.imreadAsync('/')
  }

  async faceMatching({ request, response }) {
    try {
      const modelsPath = Helpers.publicPath(`models`);
      const photoPath1 = Helpers.publicPath(`photo1.png`);
      const photoPath2 = Helpers.publicPath(`ktp.png`);
      // Construct the path to the file in the public folder
      faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

      const image1 = await canvas.loadImage(photoPath1);
      const image2 = await canvas.loadImage(photoPath2);

      // const faceMatcher = new faceapi.FaceMatcher(await faceapi.allFaces(image1), { distanceThreshold: 0.6 });

      const face1 = await faceapi
        .detectSingleFace(image1)
        .withFaceLandmarks()
        .withFaceDescriptor();
      const face2 = await faceapi
        .detectSingleFace(image2)
        .withFaceLandmarks()
        .withFaceDescriptor();
      var face2descriptor =
        "-0.16223852336406708,0.12572038173675537,0.014088502153754234,-0.12793764472007751,-0.05840979516506195,-0.07187706232070923,-0.05076248571276665,-0.1834467053413391,0.1934005320072174,-0.056172970682382584,0.2693183720111847,0.00009409771155333146,-0.1930624097585678,-0.12012606114149094,-0.036543816328048706,0.12625129520893097,-0.23575429618358612,-0.10667577385902405,-0.03929169103503227,-0.0883222222328186,0.06643124669790268,0.04331448674201965,0.06411878019571304,0.029008377343416214,-0.12459706515073776,-0.34543418884277344,-0.11112991720438004,-0.12777107954025269,0.03375975042581558,-0.0631934329867363,0.030196884647011757,0.05417963117361069,-0.23645491898059845,-0.07209072262048721,0.019963471218943596,0.15455059707164764,0.012886624783277512,0.004164986312389374,0.17133823037147522,0.0033205123618245125,-0.15580984950065613,-0.02454025112092495,0.030302690342068672,0.26987072825431824,0.228549063205719,0.013491373509168625,0.04492020606994629,-0.10988930612802505,0.06728040426969528,-0.18583320081233978,0.09767141193151474,0.12711815536022186,0.08569645881652832,0.03166752681136131,0.03617687150835991,-0.12945671379566193,0.030188409611582756,0.0751955583691597,-0.18453089892864227,0.026172906160354614,0.15830932557582855,-0.09481190145015717,-0.058235060423612595,0.017874429002404213,0.23820795118808746,0.11153970658779144,-0.14653433859348297,-0.09127839654684067,0.15095557272434235,-0.13330231606960297,-0.055507831275463104,0.052708882838487625,-0.14028096199035645,-0.17824772000312805,-0.3402491807937622,0.019841639325022697,0.48909682035446167,0.08480069041252136,-0.198985755443573,0.01886025071144104,-0.09215002506971359,-0.007337614893913269,0.1543309986591339,0.10927428305149078,-0.0598326213657856,0.0528106763958931,-0.11298419535160065,0.11032875627279282,0.19872643053531647,0.0017485145945101976,-0.07799099385738373,0.22771458327770233,-0.018897823989391327,0.08933837711811066,0.05756039172410965,0.10555730760097504,-0.009068824350833893,-0.019711457192897797,-0.12663975358009338,0.029366469010710716,0.02858276106417179,-0.04941847175359726,-0.04404538869857788,0.10799045860767365,-0.13833531737327576,0.15346336364746094,0.046109654009342194,-0.009285722859203815,-0.0745147094130516,-0.07399867475032806,-0.04390285164117813,-0.017480475828051567,0.16492816805839539,-0.23246747255325317,0.2217019647359848,0.18533214926719666,-0.01507480163127184,0.19148579239845276,0.0506504587829113,0.052070438861846924,-0.0026536087971180677,-0.08642090111970901,-0.168271005153656,-0.03370605409145355,0.006548561621457338,-0.024138284847140312,0.13585785031318665,0.03260005638003349";
      // if (!face1 || !face2) {
      //     console.log('One or both images do not contain faces.');
      //     return;
      // }

      const threshold = faceapi.euclideanDistance(
        face1.descriptor,
        face2.descriptor
      );
      // const threshold = faceapi.euclideanDistance(face1.descriptor, new Float32Array((face2descriptor.split(",")).map(parseFloat)));
      // console.log(face2.descriptor.toString());
      if (threshold > 0.5) {
        console.log("NOT MATCH : " + threshold);
      } else {
        console.log("THIS IS YOU! : " + threshold);
      }

      // const result1 = await cv.imreadAsync(photoPath1);
      // const result2 = await cv.imreadAsync(photoPath2);
      // const joinedImage = new cv.Mat([result1, result2]);
      // const joineImagePath = Helpers.publicPath(`join_${path.basename(photoPath1)}_${path.basename(photoPath2)}`);
      // await cv.imwriteAsync(joineImagePath, joinedImage);
      // return response.status(200).json({ joineImagePath });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error" });
    }
    //
    //    cv.imreadAsync('/')
  }

  static checkSocket(socket, { auth }) {
    console.log("a user connected");
    console.log(socket.id);
    socket.on("capturedImage", async ({ file, user_id }) => {
      const userFaces = await UserFace.query()
        .where({ user_id: user_id })
        .orderBy("created_at", "desc")
        .limit(1)
        .fetch();
      let threshold = 1;
      let message = "";
      let absentMarked = null;
      let success = 0;
      const filename = `absent_${Date.now()}.png`;
      const photoPath = Helpers.publicPath(filename);
      fs.writeFile(photoPath, file, (err) => {
        if (err) {
          console.error("Error saving captured image:", err);
        } else {
          console.log("Captured image saved:", photoPath);
        }
      });
      if (userFaces.rows.length == 0) {
        message = "Face data not found";
      } else {
        // // Write the binary data to a file on the server
        // COMPARE
        try {
          var face2descriptor = userFaces.rows[0].image_face_description;
          console.log("FACE 2", face2descriptor);
          const modelsPath = Helpers.publicPath(`models`);
          const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
          faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
          await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
          await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
          await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

          const image1 = await canvas.loadImage(photoPath);
          const face1 = await faceapi
            .detectSingleFace(image1)
            .withFaceLandmarks()
            .withFaceDescriptor();
          const threshold = faceapi.euclideanDistance(
            face1.descriptor,
            new Float32Array(face2descriptor.split(",").map(parseFloat))
          );
          // // DRAW FACE
          const imageRaw = await cv.imreadAsync(photoPath);
          const faces = classifier.detectMultiScale(imageRaw);
          faces.objects.forEach((faceRect) => {
            const { x, y, width, height } = faceRect;
            imageRaw.drawRectangle(
              new cv.Rect(x, y, width, height),
              new cv.Vec(0, 255, 0),
              2
            );
          });
          const markedImagePath = Helpers.publicPath(
            `absent_marked_${path.basename(photoPath)}`
          );
          await cv.imwriteAsync(markedImagePath, imageRaw);

          if (threshold > 0.5) {
            message = "Face Not Match";
            socket.emit("result", { success: 0, message: message });
            success = 0;
          } else {
            message = "Face Match";
            absentMarked = `absent_marked_${path.basename(photoPath)}`;
            success = 1;
          }
        } catch (error) {
          message = "Face not detect, please focus on camera!";
          success = 0;
        }
      }

      const attendanceHistory = new AttendanceHistory();
      attendanceHistory.user_id = user_id;
      attendanceHistory.captured = filename;
      attendanceHistory.captured_marked = absentMarked;
      attendanceHistory.source_marked =
        userFaces.rows.length === 0
          ? null
          : userFaces.rows[0].image_face_marked;
      attendanceHistory.threshold = threshold;
      attendanceHistory.message = message;
      attendanceHistory.status = success;
      attendanceHistory.method = "biometric-login";
      await attendanceHistory.save();

      if (success) {
        socket.emit("result", {
          success: 1,
          message: message,
          result: {
            absent: absentMarked,
            source: userFaces.rows[0].image_face_marked,
          },
        });
      } else {
        socket.emit("result", { success: 0, message: message });
      }
    });

    socket.on("addFace", async ({ capturedFile, user_id }) => {
      let result = null;
      let threshold = 1;
      try {
        const users = await User.query()
          .where({ id: user_id })
          .limit(1)
          .fetch();

        const user_information = await UserInformation.query()
          .where({ user_id: user_id })
          .limit(1)
          .fetch();

        const filename = `user_face_${Date.now()}.png`;
        const photoPath = Helpers.publicPath(filename);
        fs.writeFile(photoPath, capturedFile, (err) => {
          if (err) {
            console.error("Error saving captured image:", err);
          } else {
            console.log("Captured image saved:", photoPath);
          }
        });
        const modelsPath = Helpers.publicPath(`models`);
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

        const image1 = await canvas.loadImage(photoPath);
        const face1 = await faceapi
          .detectSingleFace(image1)
          .withFaceLandmarks()
          .withFaceDescriptor();

        // DRAW FACE
        const imageRaw = await cv.imreadAsync(photoPath);
        const faces = classifier.detectMultiScale(imageRaw);

        if (faces.objects.length === 1) {
          /**  THIS FLOW MATCHING WITH KYC MARKED */
          // await faces.objects.forEach(async (face) => {
          //   const faceRegion = await imageRaw.getRegion(face);
          //   threshold = faceapi.euclideanDistance(
          //     face1.descriptor,
          //     new Float32Array(
          //       users.rows[0].marked_kyc.split(",").map(parseFloat)
          //     )
          //   );
          //   const { x, y, width, height } = face;
          //   imageRaw.drawRectangle(
          //     new cv.Rect(x, y, width, height),
          //     new cv.Vec(0, 255, 0),
          //     2
          //   );
          //   if (threshold <= 0.5) {
          //     return;
          //   }
          // });
          // if (threshold <= 0.5) {
          //   const markedImagePath = Helpers.publicPath(
          //     `marked_${path.basename(photoPath)}`
          //   );
          //   await cv.imwriteAsync(markedImagePath, imageRaw);
          //   const userFace = new UserFace();
          //   userFace.user_id = user_id;
          //   userFace.image = filename;
          //   userFace.image_face_marked = `marked_${path.basename(photoPath)}`;
          //   userFace.image_face_description = face1.descriptor.toString();
          //   await userFace.save();
          //   result = {
          //     success: 1,
          //     message: "Success add face",
          //     result: `marked_${path.basename(photoPath)}`,
          //   };
          // } else {
          //   result = { success: 0, message: "Face not match" };
          // }
          /**  THIS FLOW MATCHING WITH KYC MARKED */

          /**  THIS FLOW MATCHING WITH KYC BOIVA IDENTITY VERIFICATION */
          try {
            const token = await axios.get(
              "https://sandbox.boiva.id/b2b/v0/token",
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Client-Id": "coihi028dihs5rhsai3g",
                  "X-Client-Key": "coihi028dihs5rhsai40",
                },
              }
            );

            if (token.status == 200) {
              const base64image = Buffer.from(capturedFile).toString("base64");
              const formattedFullName = user_information.rows[0].fullname
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
                .join(" ");

              // const parts = formattedFullName.split(", ");
              // const mainName = parts[0];
              // const nameWords = mainName.split(" ");
              // const filteredNameWords = nameWords.filter((word) => {
              //   return !word.includes(".");
              // });
              // const desiredName = filteredNameWords.join(" ");

              const [day, month, year] =
                user_information.rows[0].birth_date.split("-");
              const formattedDate = `${year}-${month}-${day}`;

              console.log({
                phone_number: users.rows[0].phone_number,
                email: users.rows[0].email,
                ktp: user_information.rows[0].kyc_number,
                fullname: formattedFullName,
                birth_date: formattedDate,
              });
              const identityResponse = await axios.post(
                "https://sandbox.boiva.id/b2b/v1/identity-verification",
                {
                  phone_number: "62895369163319",
                  email: users.rows[0].email,
                  ktp: user_information.rows[0].kyc_number,
                  fullname: formattedFullName,
                  birth_date: formattedDate,
                  selfie_photo: base64image,
                },
                {
                  headers: {
                    Authorization: token.data.token,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (identityResponse.status == 200) {
                const selfiePhotoStatusObj = identityResponse.data.fields.find(
                  (field) => field.field === "selfie_photo"
                );
                console.log(identityResponse, selfiePhotoStatusObj);
                if (selfiePhotoStatusObj?.status == "true") {
                  const markedImagePath = Helpers.publicPath(
                    `marked_${path.basename(photoPath)}`
                  );
                  await cv.imwriteAsync(markedImagePath, imageRaw);
                  const userFace = new UserFace();
                  userFace.user_id = user_id;
                  userFace.image = filename;
                  userFace.image_face_marked = `marked_${path.basename(
                    photoPath
                  )}`;
                  userFace.image_face_description = face1.descriptor.toString();
                  await userFace.save();

                  result = {
                    success: 1,
                    message: "Success add face",
                    result: `marked_${path.basename(photoPath)}`,
                  };
                } else {
                  result = {
                    success: 0,
                    message: "Face not match with dukcapil",
                  };
                }
              }
            }
          } catch (error) {
            result = {
              success: 0,
              message: "Something wrong : " + error?.message,
            };
          }
          /** BOIVA INTEGRATION IDENTITY VERIFICATION */
        } else {
          result = { success: 0, message: "Face not detect X" };
        }
      } catch (error) {
        result = { success: 0, message: "Face not detect Y" };
      }
      socket.emit("addFaceResult", result);
    });

    socket.on("validateKyc", async (capturedFile) => {
      let result = null;
      try {
        const filename = `kyc_${Date.now()}.png`;
        const photoPath = Helpers.publicPath(filename);
        const sharpedFilename = `sharped_kyc_${Date.now()}.jpeg`;
        const sharpedPhotoPath = Helpers.publicPath(sharpedFilename);
        fs.writeFile(photoPath, capturedFile)
          .then(() => {
            return sharp(photoPath)
              .normalise({ lower: 3, upper: 100 })
              .modulate({
                brightness: 1.1,
              })
              .toFormat("jpeg")
              .toFile(Helpers.publicPath(sharpedFilename));
          })
          .then((info) => {
            console.log(info);
          })
          .catch((err) => {
            console.error("Error:", err);
          });
        const modelsPath = Helpers.publicPath(`models`);
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
        // await faceapi.nets.faceExpressionNet.loadFromUri(modelsPath);

        const image1 = await canvas.loadImage(sharpedPhotoPath);
        const face1 = await faceapi
          .detectSingleFace(image1)
          .withFaceLandmarks()
          .withFaceDescriptor();
        // DRAW FACE
        const imageRaw = await cv.imreadAsync(sharpedPhotoPath);

        // MATCHING
        // const templatePath = Helpers.publicPath("wrong_template.png");
        const templatePath = Helpers.publicPath("kyc_template_2.jpg");
        const template = await cv.imreadAsync(templatePath);

        const matched = template.matchTemplate(imageRaw, cv.TM_CCORR_NORMED);
        const { maxLoc, maxVal } = matched.minMaxLoc();
        const threshold = 0.91;

        if (maxVal > threshold) {
          const faces = classifier.detectMultiScale(imageRaw);
          faces.objects.forEach((faceRect) => {
            const { x, y, width, height } = faceRect;
            imageRaw.drawRectangle(
              new cv.Rect(x, y, width, height),
              new cv.Vec(0, 255, 0),
              2
            );
          });

          const markedImagePath = Helpers.publicPath(
            `marked_${path.basename(sharpedPhotoPath)}`
          );

          await cv.imwriteAsync(markedImagePath, imageRaw);

          /** BOIVA INTEGRATION KTP OCR */
          let kyc_information = null;
          try {
            const token = await axios.get(
              "https://sandbox.boiva.id/b2b/v0/token",
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Client-Id": "coihi028dihs5rhsai3g",
                  "X-Client-Key": "coihi028dihs5rhsai40",
                },
              }
            );

            if (token.status == 200) {
              const base64image = Buffer.from(capturedFile).toString("base64");
              const ocrResponse = await axios.post(
                "https://sandbox.boiva.id/b2b/v0/ktp-ocr",
                {
                  ktp_photo: base64image,
                },
                {
                  headers: {
                    Authorization: token.data.token,
                  },
                }
              );

              if (ocrResponse.status == 200) {
                kyc_information = ocrResponse.data.data;
              }
            }
          } catch (error) {
            // console.log(error);
          }

          /** BOIVA INTEGRATION KTP OCR */

          result = {
            success: 1,
            message: "Success verify",
            result: {
              image: `marked_${path.basename(sharpedPhotoPath)}`,
              descriptor: face1.descriptor.toString(),
              kyc_information: kyc_information,
            },
          };
        } else {
          result = {
            success: 0,
            message: "KTP is not valid",
            result: null,
          };
        }
      } catch (error) {
        console.log(error);
        result = { success: 0, message: error.message, result: null };
      }

      socket.emit("validateKycResult", result);
    });

    socket.on("biometricLogin", async ({ capturedFile, email }) => {
      let message = "";
      let result = false;
      let userData = null;
      let threshold = 1;
      const users = await User.query().where({ email: email }).limit(1).fetch();
      const filename = `biometric_login_${Date.now()}.png`;
      const photoPath = Helpers.publicPath(filename);
      try {
        fs.writeFile(photoPath, capturedFile, (err) => {
          if (err) {
            console.error("Error saving captured image:", err);
          } else {
            console.log("Captured image saved:", photoPath);
          }
        });

        const modelsPath = Helpers.publicPath(`models`);
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        const eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

        const image1 = await canvas.loadImage(photoPath);
        const face1 = await faceapi
          .detectSingleFace(image1)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const imageRaw = await cv.imreadAsync(photoPath);
        const facesRaw = await classifier.detectMultiScale(imageRaw);
        if (facesRaw.objects.length === 1) {
          facesRaw.objects.forEach(async (face) => {
            const faceRegion = await imageRaw.getRegion(face);
            const eyes = await eyeClassifier.detectMultiScale(faceRegion);
            // const photoPath = Helpers.publicPath(filename)
            // await cv.imwriteAsync(Helpers.publicPath(`biometric_eye1_login_${Date.now()}.png`), await faceRegion.getRegion(eyes.objects[0]));
            // await cv.imwriteAsync(Helpers.publicPath(`biometric_eye2_login_${Date.now()}.png`),  await faceRegion.getRegion(eyes.objects[1]));
            // console.log("eyes.objects ", eyes.objects)
            // if (eyes.objects.length === 2) {
            // const [eye1, eye2] = eyes.objects;
            // const eyeRegion1 = await faceRegion.getRegion(eye1);
            // const eyeRegion2 = await faceRegion.getRegion(eye2);
            // const avgIntensity1 = await eyeRegion1.mean().x;
            // const avgIntensity2 = await eyeRegion2.mean().x;
            // const blinkThreshold = 100;
            // await cv.imwriteAsync(Helpers.publicPath(`biometric_eye1_login_${Date.now()}.png`), await faceRegion.getRegion(eyes.objects[0]));
            // await cv.imwriteAsync(Helpers.publicPath(`biometric_eye2_login_${Date.now()}.png`),  await faceRegion.getRegion(eyes.objects[1]));
            // console.log("avgIntensity1 ", avgIntensity1)
            // console.log("avgIntensity2 ", avgIntensity2)
            // if (avgIntensity1 < blinkThreshold && avgIntensity2 < blinkThreshold) {
            // try {
            threshold = faceapi.euclideanDistance(
              face1.descriptor,
              new Float32Array(
                users.rows[0].marked_kyc.split(",").map(parseFloat)
              )
            );
            console.log("THRESHOLD ", threshold);
            if (threshold <= 0.52) {
              result = true;
              message = "Success login";
              userData = users.rows[0];
              socket.emit("biometricLoginResult", {
                success: 1,
                message: message + " Threshold : " + threshold,
                result: users.rows[0],
              });
            } else {
              message = "Face not match";
              result = false;
              socket.emit("biometricLoginResult", {
                success: 0,
                message: message + " Threshold : " + threshold,
              });
            }
            // }
            // catch (error) {
            //   message = "Face not focused";
            //   result = false;
            //   socket.emit("biometricLoginResult", { success: 0, message: message })
            // }

            // } else {
            //   message = "Eye not detect"
            //   result = false;
            //   socket.emit("biometricLoginResult", { success: 0, message: message })
            //   return;
            // }
            // } else {
            //   message = "Blink not detect"
            //   result = false;
            //   socket.emit("biometricLoginResult", { success: 0, message: message })
            // }
          });
        } else {
          message = "Face not focused";
          result = false;
          socket.emit("biometricLoginResult", { success: 0, message: message });
          return;
        }

        // threshold = faceapi.euclideanDistance(face1.descriptor, new Float32Array((users.rows[0].marked_kyc.split(",")).map(parseFloat)));
        // if (threshold <= 0.5) {
        //   if (!result) {
        //     result = true;

        //   }
        // }

        // users.rows.forEach(async (user, index) => {
        //   if (user.marked_kyc) {
        //     threshold = faceapi.euclideanDistance(face1.descriptor, new Float32Array((user.marked_kyc.split(",")).map(parseFloat)));
        //     console.log("THRESHOLD ", threshold)
        //     if (threshold < 0.53) {
        //       if (!result) {
        //         result = true;
        //         userData = user;
        //       }
        //     }
        //   }
        // })
        // console.log(userData)
      } catch (error) {
        result = false;
        message = "Face not match";
        socket.emit("validateFaceResult", {
          success: 0,
          message: "Face not match",
        });
      }

      setTimeout(async () => {
        const attendanceHistory = new AttendanceHistory();
        attendanceHistory.user_id = userData ? userData.id : null;
        attendanceHistory.captured = filename;
        attendanceHistory.threshold = threshold;
        attendanceHistory.message = message;
        attendanceHistory.status = result;
        attendanceHistory.method = "biometric-login";
        await attendanceHistory.save();
      }, 3000);

      // if (result) {
      //   socket.emit("biometricLoginResult", { success: 1, message: "Success login", result: userData })
      // } else {
      //   socket.emit("biometricLoginResult", { success: 0, message: message })
      // }
    });

    socket.on("disconnect", function () {
      console.log("user disconnected");
    });

    socket.on("validateFace", async ({ capturedFile, currentEmail }) => {
      let message = "";
      let result = false;
      let userData = null;
      let threshold = 1;
      const users = await User.query()
        .where({ email: currentEmail })
        .limit(1)
        .fetch();
      const filename = `validate_face_${Date.now()}.png`;
      const photoPath = Helpers.publicPath(filename);
      try {
        fs.writeFile(photoPath, capturedFile, (err) => {
          if (err) {
            console.error("Error saving captured image:", err);
          } else {
            console.log("Captured image saved:", photoPath);
          }
        });

        const modelsPath = Helpers.publicPath(`models`);
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        const eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

        const image1 = await canvas.loadImage(photoPath);
        const face1 = await faceapi
          .detectSingleFace(image1)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const imageRaw = await cv.imreadAsync(photoPath);
        let blinkStatus = false;

        // const grayImg = imageRaw.bgrToGray();
        const facesRaw = await classifier.detectMultiScale(imageRaw);
        if (facesRaw.objects.length === 1) {
          facesRaw.objects.forEach(async (face) => {
            const faceRegion = await imageRaw.getRegion(face);
            const eyes = await eyeClassifier.detectMultiScale(faceRegion);
            threshold = faceapi.euclideanDistance(
              face1.descriptor,
              new Float32Array(
                users.rows[0].marked_kyc.split(",").map(parseFloat)
              )
            );
            console.log("THRESHOLD ", threshold);
            if (threshold <= 0.5) {
              socket.emit("validateFaceResult", {
                success: 1,
                message: "Berhasil Membuat Transaksi",
              });
            } else {
              message = "Face not match";
              socket.emit("validateFaceResult", {
                success: 0,
                message: message,
              });
            }
          });
        } else {
          message = "Face not focused";
          socket.emit("validateFaceResult", { success: 0, message: message });
          return;
        }
      } catch (error) {
        console.log(error);
        socket.emit("validateFaceResult", {
          success: 0,
          message: "Face not match",
        });
      }
    });

    //** BEKYC VERIFICATION WITH BOIVA V2 */
    socket.on("validateKycV2", async (capturedFile) => {
      console.log(capturedFile);
      let result = null;
      try {
        const filename = `kyc_${Date.now()}.png`;
        const photoPath = Helpers.publicPath(filename);
        const sharpedFilename = `sharped_kyc_${Date.now()}.jpeg`;

        await fs.promises.writeFile(photoPath, capturedFile);
        /** BOIVA INTEGRATION KTP OCR */
        let kyc_information = null;
        try {
          const token = await axios.get(
            "https://sandbox.boiva.id/b2b/v0/token",
            {
              headers: {
                "Content-Type": "application/json",
                "X-Client-Id": "coihi028dihs5rhsai3g",
                "X-Client-Key": "coihi028dihs5rhsai40",
              },
            }
          );

          if (token.status == 200) {
            const base64image = Buffer.from(capturedFile).toString("base64");
            const ocrResponse = await axios.post(
              "https://sandbox.boiva.id/b2b/v0/ktp-ocr",
              {
                ktp_photo: base64image,
              },
              {
                headers: {
                  Authorization: token.data.token,
                },
              }
            );

            if (ocrResponse.status == 200) {
              kyc_information = ocrResponse.data.data;
            }
          }
        } catch (error) {
          console.log(error);
        }
        /** BOIVA INTEGRATION KTP OCR */

        result = {
          success: 1,
          message: "Success verify",
          result: {
            image: filename,
            descriptor: "",
            kyc_information: kyc_information,
          },
        };
        // }
      } catch (error) {
        // console.log(error);
        result = { success: 0, message: error.message, result: null };
      }

      console.log(result);
      // setTimeout(() => {
      //   socket.emit("validateKycResultV2", result);
      // }, 5000)
      socket.emit("validateKycResultV2", result);
    });

    socket.on(
      "verifyIdentity",
      async ({
        kycFile,
        selfieFile,
        form = { nik: "", name: "", phonenumber: "", birthplace: "" },
      }) => {

        // if(kycFile != '' || kycFile != null){
        //   console.log("MASUK SINI ?")
        //   const kycPath = await fs.promises.readFile(Helpers.publicPath(kycFile));
        //   const base64kyc = Buffer.from(kycPath).toString("base64");
        // }

        // console.log("kycFile", kycFile == '');
        // return;
        const base64selfie = Buffer.from(selfieFile).toString("base64");
        let identityResult = null;
        let telcoReuslt = {
          phone_active: "false",
          phone_match: "false",
        };
        let result = null;
        let token = null;
        try {
          /** 1. GET TOKEN */
          token = await axios.get("https://sandbox.boiva.id/b2b/v0/token", {
            headers: {
              "Content-Type": "application/json",
              "X-Client-Id": "coihi028dihs5rhsai3g",
              "X-Client-Key": "coihi028dihs5rhsai40",
            },
          });

          console.log("token", token.data);
          if (!token.status == 200) {
          }
        } catch (error) {
          console.log("ERROR TOKEN", error.response);
        }

        try {
          /** 2. IDENTIFY KYC */
          const identityResponse = await axios.post(
            "https://sandbox.boiva.id/b2b/v1/identity-verification",
            {
              phone_number: form.phonenumber,
              email: "admin@randstack.com",
              ktp: form.nik,
              fullname: form.name,
              birth_date: "",
              birth_place: form.birthplace,
              selfie_photo: base64selfie,
            },
            {
              headers: {
                Authorization: token.data.token,
              },
            }
          );

          console.log("identity", identityResponse.data);

          if (!identityResponse.status == 200) {
            identityResult = null;
          } else {
            identityResult = identityResponse.data.fields;
          }
        } catch (error) {
          console.log("ERROR COK ", error);
          identityResult = error.response.data.errors;
        }

        try {
          /** 3. IDENTIFY PHONENUMBER */
          // BOIVA API TELCO VERIFICATION
          // const telcoResponse = await axios.post(
          //   "https://sandbox.boiva.id/b2b/v0/telcos-verification",
          //   {
          //     phone_number: form.phonenumber,
          //     ktp: form.nik,
          //   },
          //   {
          //     headers: {
          //       Authorization: token.data.token,
          //     },
          //   }
          // );

          // console.log("telcoResponse", telcoResponse);
          // if (!telcoResponse.status == 200) {
          //   telcoReuslt = null;
          // } else {
          //   telcoReuslt = telcoResponse.data.data;
          // }

          /** ITR API PHONE VERIFICATION */
          const itrTokenResponse = await axios.get(
            "http://54.238.92.49:8082/api/sahaid/v1/token",
            {
              headers: {
                "api-key": "3a250da4-98aa-4319-b4f4-31bfe83201e7",
                "secret-key": "co4j9447fhkjfv76jnd0",
              },
            }
          );

          const itrToken = itrTokenResponse.data.data.access_token;
          let telcoResponse = null;
          if (form.phonenumber != "6288899999999") {
            telcoResponse = await axios.post(
              "http://54.238.92.49:8082/api/sahaid/v1/phone-id",
              {
                phone: form.phonenumber,
              },
              {
                headers: {
                  Authorization: itrToken,
                },
              }
            );
            if (!telcoResponse.status == 200) {
              telcoReuslt = {
                phone_active: "false",
                phone_match: "false",
              };
            } else {
              telcoReuslt = {
                phone_active: "true",
                phone_match:
                  telcoResponse?.data?.data?.nik == form.nik ? "true" : "false",
              };
            }
          }

          /** ITR API PHONE VERIFICATION */
        } catch (error) {
          console.log("ERROR ", error.response);
          telcoReuslt = {
            phone_active: "false",
            phone_match: "false",
          };
        }

        result = {
          success: 1,
          message: "Success verify",
          result: {
            identity: identityResult,
            telco: telcoReuslt,
          },
        };
        socket.emit("verifyIdentityResult", result);
        // console.log(base64kyc, base64selfie);
      }
    );
    //** BEKYC VERIFICATION V2 */
  }

  async addFace() {}

  async realtimeFacing({ view, auth }) {
    // for (let i = 0; i < 1000000; i++) {
    //   try {
    //     const camera = new cv.VideoCapture(i);
    //     break;
    //   } catch (error) {
    //     console.log(error + 'index :' + i);
    //   }
    // }

    return view.render("realtime-facing");
  }
  // async matchingRealtime() {

  //     return threshold;
  //     if (threshold > 0.5) {
  //         console.log("NOT MATCH : " + threshold)
  //     } else {
  //         console.log("THIS IS YOU! : " + threshold)
  //     }
  // }
}

module.exports = FaceRecognitionController;
