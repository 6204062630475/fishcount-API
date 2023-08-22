import * as tf from "@tensorflow/tfjs";
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; // ratios for boxes
  const input = tf.tidy(() => {
    // const img = tf.browser.fromPixels(source);
    const img = source;

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2); // get source width and height
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
  console.log("img ",input)

  return [input, xRatio, yRatio];
};
export const detectImage = (imgSource, model, classThreshold) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  tf.engine().startScope(); // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(
    imgSource,
    modelWidth,
    modelHeight
  );
  console.log("imgSource: ", imgSource);
  console.log("input: ", input);
  model.net.executeAsync(input).then((res) => {
    const [boxes, scores, classes] = res.slice(0, 3);
    const class_data = classes.dataSync();
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    scores_data.forEach((score) => {
      if (score > classThreshold) {
        console.log("+++++++++++++++++scores: ", score);
      } else {
        console.log("scores: ", score);
      }
    });
    class_data.forEach((classs) => {
      console.log("+++++++++++++++++classs: ", classs);
    });

    // console.log("scores_data",scores_data)
    // console.log("boxes_data",boxes_data)

    let a = 0;
    for (let i = 0; i < scores_data.length; ++i) {
      if (scores_data[i] > classThreshold) {
        a++;
      }
    }
    console.log("Count: ", a);
    // const classes_data = classes.dataSync();

    tf.dispose(res); // clear memory
  });

  tf.engine().endScope(); // end of scoping
};
