import * as tf from "@tensorflow/tfjs-node";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import gm from "gm";

const imagePath = "./Image/CaptureImage.jpg";

const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; // ratios for boxes
  const input = tf.tidy(() => {
    // const img = tf.browser.fromPixels(source);
    const img = source;

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2);
    // get source width and height
    // get source width and height
    const maxSize = Math.max(w, h); // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ]);
    xRatio = maxSize / w; // update xRatio
    yRatio = maxSize / h; // update yRatio

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
  });
  // console.log("img ",input)

  return [input, xRatio, yRatio];
};

export const detectImage = (imgSource, model, classThreshold, imageBuffer) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height
  tf.engine().startScope(); // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(
    imgSource,
    modelWidth,
    modelHeight
  );

  model.net.executeAsync(input).then((res) => {
    const [boxes, scores, classes, num] = res.slice();
    const class_data = classes.dataSync();
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const num_data = num.dataSync();

    const pic = gm(imagePath);

    for (let i = 0; i < scores_data.length; ++i) {
      if (scores_data[i] > classThreshold) {
        // console.log("scores_data: ", scores_data[i]);
        let [xmin, ymin, xmax, ymax] = boxes_data.slice(i * 4, (i + 1) * 4);
        xmin *= 640 * xRatio;
        xmax *= 640 * xRatio;
        ymin *= 480 * yRatio;
        ymax *= 480 * yRatio;

        const boxWidth = xmax - xmin;
        const boxHeight = ymax - ymin;

        pic
          .stroke("#ff0000", 2)
          .fill("None")
          .drawRectangle(xmin, ymin, xmin + boxWidth, ymin + boxHeight);
      }
    }
    if (num_data[0] > 0) {
      const now = new Date();
      const dateTime = now.toLocaleString();
      const data = `${num_data[0]},${dateTime}\n`;
    }
    console.log("Count: ", num_data[0]);

    const outputImagePath = "./Image/CaptureImageWithBoxes.jpg";
    pic.write(outputImagePath, (err) => {
      if (!err) console.log("draw successful");
    });

    tf.dispose(res); // clear memory
  });
  tf.engine().endScope(); // end of scoping
};
