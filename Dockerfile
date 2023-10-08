# Use an official Node.js runtime as a base image
FROM node:14

# Install any necessary dependencies for OpenCV (e.g., build-essential, CMake)
RUN apt-get update && apt-get install -y \
  libpango1.0-dev \
  libx11-dev \
  libopencv-dev \
  libcairo2-dev \
  libjpeg-dev \
  libgif-dev \
  libpng-dev \
  build-essential \
  cmake \
  pkg-config

# Copy your Node.js application code to the container
WORKDIR /usr/src/app
COPY . .

# Install OpenCV
RUN npm install
RUN npm i --global @adonisjs/cli
RUN npm i --save opencv4nodejs
RUN npm i --build-from-source canvas
RUN npm i --save @adonisjs/websocket
RUN npm i --save @adonisjs/websocket
RUN npm i --save @tensorflow/tfjs-node
RUN npm i --save @tensorflow/tfjs@1.7.4
RUN npm i --save @tensorflow/tfjs-node@1.7.4
RUN npm i --save @tensorflow/tfjs-node-gpu@1.7.4
RUN npm i --save @tensorflow/tfjs-core@1.7.4
RUN npm i --save sharp
RUN npm i --save dlib
RUN npm i --save face-api.js
RUN npm i --save node-gyp
RUN npm i --save node-pre-gyp
RUN npm i --save socket.io
RUN npm i --save mysql
# Start your Node.js application
