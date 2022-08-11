/*
*	This script has been generated for the "Speaker Recognition System"
* The original author of the script is
*	Swapnil S Sontakke, Project Associate, IIIT, Dharwad
*	Year: May, 2022
*/

/*Global variables to be used across all the functions in this file*/
let mediaRecorder, audioURL, laudioURL;
let audioSource, buttonText;
let chunks = [], longchunks = [], blob;
let timerElement, ticker;

/*On page load event, stopRecording button will be disabled and 
  its color will be set to gray
*/
window.addEventListener('load', (event) => {
		getDevices();
		stopRecording.disabled = true;
		stopRecording.style.backgroundColor = "grey";
		stopRecording.style.border = 'grey';
	});


/*Function to get a list of all IO devices connected to this device*/
function getDevices()
{
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
	{
	  console.log("enumerateDevices() not supported.");
	  return;
	}
	else
	{
		navigator.mediaDevices.getUserMedia({
    		audio: true
		}).then(()=>{
			// List cameras and microphones.
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
			  devices.forEach(function(device) {
			    // console.log(device.kind + ": " + device.label +
			    //             " id = " + device.deviceId);
			});
			console.log('Connected to audio input...')
			console.log('This page is using microphone.');
			})
        })
		.catch(function(err) {
		  console.log(err.name + ": " + err.message);
		  alert(err.message + ": Please connect a microphone.")
		});
	}
}

/*Window.load function used to access the audio source and button on the web page*/
window.onload = function() {
	audioSource = document.getElementById('audioSRC1');
	buttonText = document.getElementById('recordButton').value;
	buttonText2 = document.getElementById('stopRecording').value;
}

/*Function to start the audio recording and send the small
  chunks to the server for processing.
 */
function tstart()
{
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
	{
	  console.log("enumerateDevices() not supported.");
	  return;
	}
	else
	{
		navigator.mediaDevices.getUserMedia({
			audio: true
		}).then(async function(mediaStreamObj)
		{
			mediaRecorder= new MediaRecorder(mediaStreamObj);
			if(mediaRecorder.state == 'inactive')
			{
    		mediaRecorder.start();
       	console.log('Recording State Now: '+ mediaRecorder.state)
       	recordButton.disabled = true;
       	recordButton.style.backgroundColor = "grey";
				recordButton.style.border = 'grey';

       	stopRecording.disabled = false;
       	stopRecording.style.backgroundColor = "black";
				stopRecording.style.border = 'black';
       	
       	mediaRecorder.ondataavailable = function(ev)
  			{
          chunks.push(ev.data);
          console.log('Displaying Chunks: ')
          console.log(chunks);
          blob = new Blob(chunks,
          {
          	'type':'audio/mp3',
          	'codecs': 'opus'
          });
      		console.log('Sending the recorded stream to the server: ')
		      chunks = [];
          //audioURL = window.URL.createObjectURL(blob);		            
          // audioSource.src = audioURL;
          // audioSource.preload = 'none';
          let fileName = 'recordedFile';
          let fName = document.getElementById('fname').value;
          let lName = document.getElementById('lname').value;
          let gender = document.getElementById('gender').value;
          let age = document.getElementById('age').value;

          //Upload to the directory
          var audioData = new FormData();
          request = new XMLHttpRequest();
          audioData.append('content-type', 'multipart/form-data');
          audioData.append('audioChunk', blob, fileName+'.mp3');
          audioData.append('firstName', fName);
          audioData.append('lastName', lName);
          audioData.append('gender', gender);
          audioData.append('age', age);
          request.open('post', '/uploadTAudio', true);
          request.send(audioData);
          request.onreadystatechange = function(){
          	if(request.readyState === 4) {
          		alert(request.response)
          		location.replace("/")
          	}
					}
          console.log('Audio data sent to the server for processing.');
    		}
    	}
			else
		  {
		  	console.log('Media Recorder state is inactive. Please enable the microphone to allow browser to access the microphone.');
		  	alert('Please allow your browser to access the microphone.')
		  }
		})
		.catch(function(err) {
		  console.log(err.name + ": " + err.message);
		});
	}
}

/*Function to stop the audio recording*/
function tstop()
{
		recordButton.disabled = false;
		recordButton.style.backgroundColor = "black";
		recordButton.style.border = 'black';

    stopRecording.disabled = true;
		stopRecording.style.backgroundColor = "grey";
		stopRecording.style.border = 'grey';

		clearInterval(ticker);
		timerElement.innerHTML = "Enrollment under progress, wait..."

		if(mediaRecorder.state != 'inactive'){
			mediaRecorder.stop();
		}
    console.log('Recording State Now: '+ mediaRecorder.state)
}


/*Function to start the audio recording for verification and send the small
  chunks to the server for processing.
*/
function vstart()
{
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
	{
	  console.log("enumerateDevices() not supported.");
	  return;
	}
	else
	{

		navigator.mediaDevices.getUserMedia({
			audio: true
		}).then(async function(mediaStreamObj)
		{
			mediaRecorder= new MediaRecorder(mediaStreamObj);
			if(mediaRecorder.state == 'inactive')
			{
    		mediaRecorder.start();
	       	console.log('Recording State Now: '+ mediaRecorder.state)
	       	recordButton.disabled = true;
	       	recordButton.style.backgroundColor = "grey";
					recordButton.style.border = 'grey';

	       	stopRecording.disabled = false;
	       	stopRecording.style.backgroundColor = "black";
					stopRecording.style.border = 'black';
       	
       		mediaRecorder.ondataavailable = function(ev)
  			{
				chunks.push(ev.data);
				console.log('Displaying Chunks: ')
				console.log(chunks);
				blob = new Blob(chunks,
				{
					'type':'audio/wav',
					'codecs': 'opus'
				});
  			console.log('Sending the recorded stream to the server: ')
      	chunks = [];
				//audioURL = window.URL.createObjectURL(blob);		            
				// audioSource.src = audioURL;
				// audioSource.preload = 'none';
				let fileName = 'recordedFile';
				let sid = document.getElementById('speakerID').value;

				//Upload to the directory
				var audioData = new FormData();
				request = new XMLHttpRequest();
				audioData.append('content-type', 'multipart/form-data');
				audioData.append('audioChunk', blob, fileName+'.wav');
				audioData.append('sid', sid);
				request.onreadystatechange = function(){
					// if(request.readyState === 4) {
						console.log(request.response)
						if(request.response == "1") {
							output.innerHTML = 'Speaker is verified successfully!!!'
							output.style.color = 'green'
							output.style.font = '15px Arial, sans-serif'
							output.style.fontWeight = 'bold'
						}
						else if (request.response == "0"){
							output.innerHTML = 'Speaker not recognized. Please try again.'
							output.style.color = 'red'
							output.style.font = '15px Arial, sans-serif'
							output.style.fontWeight = 'bold'
						}
						else if(request.response == "-1"){
							alert('Speaker does not exist. First enroll and then try again.')
							output.innerHTML = 'Speaker does not exist. First enroll and then try again.'
							output.style.color = 'red'
							output.style.font = '15px Arial, sans-serif'
							output.style.fontWeight = 'bold'
						}
						else {
							output.innerHTML = 'Unable to process the request. Please reolad the page and try again.'
							output.style.color = 'red'
							output.style.font = '15px Arial, sans-serif'
							output.style.fontWeight = 'bold'
						}
					// }
				}
				request.open('post', '/uploadVAudio');
				request.send(audioData);
				console.log('Audio data sent to the server for processing.');
    		}
    	}
	else
	{
		console.log('Media Recorder state is inactive. Please enable the microphone to allow browser to access the microphone.');
	  	alert('Please allow your browser to access the microphone.')
	}
	})
	.catch(function(err) {
		  console.log(err.name + ": " + err.message);
	});
	}
}

/*Function to stop the verification audio recording*/
function vstop()
{
	recordButton.disabled = false;
	recordButton.style.backgroundColor = "black";
	recordButton.style.border = 'black';

  stopRecording.disabled = true;
	stopRecording.style.backgroundColor = "grey";
	stopRecording.style.border = 'grey';

	clearInterval(ticker);
	timerElement.innerHTML = "Recording is stopped. Not Recording..."


	if(mediaRecorder.state != 'inactive'){
		mediaRecorder.stop();
	}
  console.log('Recording State Now: '+ mediaRecorder.state)
}

function timer()
{
	timerElement = document.getElementById('timer');
	startTime = 0;
	endTime = 120;

	ticker = setInterval(function showTime(){
		timerElement.innerHTML = startTime + " " +"seconds";
		startTime++;

		if(startTime >= endTime){
			clearInterval(ticker);
			timerElement.innerHTML = "You can stop recording now."
		}
	}, 1000)
}
