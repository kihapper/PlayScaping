//Forked from the ml5js image classification example
//https://github.com/ml5js/ml5-examples/tree/release/p5js/ImageClassification
//Added mobile compatibility 

let classifier;
let video;
let currentWord;
let currentIndex = 0;
let isPlaying = false;

//put the target words here...
const words = ['keyboard','wig','toilet seat','paper towel','restraunt','television','cab','barbershop','drum','truck','banana'];

//debug
//const words = ['mask','restraunt'];

let oneWordRes = "loading..";
let confidence_score = "";


//——————— Below is p5.js————————————————————————————


function setup() {

  createCanvas(windowWidth, windowHeight);
  background(0);
  frameRate(20);

  //Setting up the video....
  var constraints = {
    audio: false,
    video: {
      //Change this part to swap the camera
      facingMode: "user",
      //facingMode: "environment",
      frameRate: 15
    }
  };
  video = createCapture(constraints);
  video.elt.setAttribute('playsinline', '');
  video.hide();

  
  //When model is ready, call modelReady();
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);


  //!! ————注意 Tricky Mobile Alert 注意——————!!!
  // speech synthesis function on mobile, only works when the user volunteering PRESSED a button
  // So it is important to trigger the button command on pressing start

  select('#start').mousePressed(function() {
    speechSynthesis.speak(voiceAlert);

    select('#status').html('Game Started, please turn up volume.');
    playNextWord();
  });

  select('#next').mousePressed(function() {
    speechSynthesis.speak(voiceAlert);

    select('#status').html('Game Started, please turn up volume.');
    currentIndex++;
    if (currentIndex >= words.length) {
      currentIndex = 0;
    }
    playNextWord();
  });

}


//——————— plain javascript for speech synthesis—————
const voiceAlert = new SpeechSynthesisUtterance('Can you find me things?')

voiceAlert.addEventListener('end', function(event) { 
  console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
  speechEnded();
});
//———————————————————————————————————————————————————


function draw(){
  image(video, 0, 0, windowWidth, windowHeight);
  textSize(120);
  fill(10, 10, 255);
  textFont('monospace');
  textAlign(CENTER);
  text(oneWordRes, windowWidth/2, windowHeight/2);
  text(confidence_score + "%", windowWidth/2, windowHeight/2 + 150);
}


function playNextWord() {
  //speechSynthesis.speak(voiceAlert);
  isPlaying = true;
  currentWord = words[currentIndex];
  select('#instruction').html(`Go and find ${currentWord}!!`);
  
  // Call the classifyVideo function to start classifying the video
  //classifyVideo();
}

function modelReady() {
  // Change the status of the model once its ready
  oneWordRes = "Press Start";
  select('#status').html('Model Loaded, press Start Game');
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
  confidence_score = floor(results[0].confidence*100);

  // Split the first result string by coma and get the first word
   oneWordRes = result.split(',')[0];
  // Get the top 3 results as strings in an array
  // Read more about map function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  const top3Res = results.map(r => r.label);
  // Find if any of the top 3 result strings includes the current word
  // Read more about find function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const ifFound = top3Res.find(r => r.includes(currentWord))

  if (ifFound) {
    // If top 3 results includes the current word
    isPlaying = false;
    voiceAlert.text = `Great. You found ${currentWord}. Thank you very much` ;
    speechSynthesis.speak(voiceAlert);
    select('#instruction').html(`You found the ${currentWord}!!`);
    select('#status').html('You win, push Next Target for the next level');
  } else {

    //Change depending on the probability
    if(confidence_score >= 50){
      voiceAlert.text = `That is definetely ${oneWordRes}` ;
      speechSynthesis.speak(voiceAlert);
      //select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }
    else if(confidence_score >= 30 && confidence_score < 50){
      voiceAlert.text = `That should be a ${oneWordRes}?` ;
      speechSynthesis.speak(voiceAlert);
      //select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }
    else if(confidence_score >= 15 && confidence_score < 30){
      voiceAlert.text = `Not sure, it might be a ${oneWordRes}` ;
      speechSynthesis.speak(voiceAlert);
      //select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }
    else if(confidence_score < 15){
      voiceAlert.text = `I have no idea, is it a ${oneWordRes}?` ;
      speechSynthesis.speak(voiceAlert);
      //select('#message').html(`${oneWordRes} : ${confidence_score} %`);
    }

  }
}

//Everytime the speech ends, the video gets classified.
function speechEnded() {
  if (isPlaying) classifyVideo();
}