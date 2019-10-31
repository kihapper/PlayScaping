let classifier;
let video;
let currentWord;
let currentIndex = 0;
let isPlaying = false;
const words = ['banana', 'watch', 'shoe', 'book', 'cellphone', 'keyboard', 'shirt', 'pants', 'cup'];

let timeStamp;

//VOICE
//const myVoice = new p5.Speech();

function setup() {

  createCanvas(windowWidth, windowHeight);
  background(0);
  frameRate(20);
  var constraints = {
    audio: false,
    video: {
      facingMode: "environment",
      frameRate: 15
    }
  };

  video = createCapture(constraints);
  video.elt.setAttribute('playsinline', '');
  video.hide();

  /*
  noCanvas();
  // Create a camera input
  video = createCapture(VIDEO);
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  */
  
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);

  select('#start').mousePressed(function() {
    playNextWord();
  });

  select('#next').mousePressed(function() {
    currentIndex++;
    if (currentIndex >= words.length) {
      currentIndex = 0;
    }
    playNextWord();
  });

  // speechEnded function will be called when an utterance is finished
  // Read more at p5.speech's onEnd property: http://ability.nyu.edu/p5.js-speech/
  //!——— myVoice.onEnd = speechEnded;
}

function draw(){
  image(video, 0, 0, windowWidth, windowHeight);
}

const voiceAlert = new SpeechSynthesisUtterance('Let us Start')
voiceAlert.addEventListener('end', function(event) { 
  console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');

  // var temptimeStamp = millis();
  // var timeDiff = temptimeStamp - timeStamp;

  // console.log('TimeDiff : ' + timeDiff);
  // console.log('temptimeStamp' + temptimeStamp);

  speechEnded();

 
});

function playNextWord() {

  speechSynthesis.speak(voiceAlert);

  isPlaying = true;
  currentWord = words[currentIndex];
  select('#instruction').html(`Go find ${currentWord}!`);
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

function modelReady() {
  // Change the status of the model once its ready
  select('#status').html('Model Loaded');
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}
// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by confidence.
  // Get the first result string
  const result = results[0].label;
  const confidence_score = floor(results[0].confidence*100);

  // Split the first result string by coma and get the first word
  const oneWordRes = result.split(',')[0];
  // Get the top 3 results as strings in an array
  // Read more about map function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  const top3Res = results.map(r => r.label);
  // Find if any of the top 3 result strings includes the current word
  // Read more about find function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const ifFound = top3Res.find(r => r.includes(currentWord))
  if (ifFound) {
    // If top 3 results includes the current word
    isPlaying = false;
    voiceAlert.text = `You found ${currentWord}` ;
    speechSynthesis.speak(voiceAlert);
    select('#message').html(`You found ${currentWord}!`);

  } else {

    //Change depending on the probability
    if(confidence_score >= 50){
      voiceAlert.text = `That is definetely ${oneWordRes}` ;
      speechSynthesis.speak(voiceAlert);
      select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }
    else if(confidence_score >= 20 && confidence_score < 50){
      voiceAlert.text = `That should be a ${oneWordRes}?` ;
      speechSynthesis.speak(voiceAlert);
      select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }
    else if(confidence_score < 20){
      voiceAlert.text = `It might be a ${oneWordRes}` ;
      speechSynthesis.speak(voiceAlert);
      select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }

  }
}

function speechEnded() {
  if (isPlaying) classifyVideo();
  console.log("isPlaying is :" + isPlaying);
}