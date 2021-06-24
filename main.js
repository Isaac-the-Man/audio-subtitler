var fileUpload = document.querySelector('#songSrc');
var txtUpload = document.querySelector('#subSrc');
var audioCtrl = document.querySelector('#audioControl');
var subDisplay = document.querySelector('#subDisplay');
var srtOutput = document.querySelector('#srtOutput');

fileUpload.addEventListener('change', handleAudio, false);
function handleAudio() {
	var audioSrc = this.files[0];
	audioCtrl.src = URL.createObjectURL(audioSrc);
	audioCtrl.load();
	audioCtrl.onended = function() {
		if (srtList[srtList.length - 1].end === null) {
			srtList[srtList.length - 1].end = formatTime(audioCtrl.currentTime);
		}
		refresh();
	}
}


var subList = [];
var srtList = [];
var subIndex = -1;
txtUpload.addEventListener('change', handleText, false);
async function handleText() {
	var subSrc = this.files[0];
	var fileReader = new FileReader();
	fileReader.addEventListener('load', function (e) {
		subList = e.target.result.split('\n');
		subList.forEach((line, i) => {
			srtList.push({
				index: i,
				start: null,
				end: null,
				text: line
			});
		});
		refresh();
	});
	fileReader.readAsText(subSrc);
}

var subMode = 'text';
function refresh() {
	subDisplay.innerHTML = '';
	subList.forEach((line, i) => {
		let p = document.createElement('p');
		p.textContent = line;
		p.id = `line-${i}`;
		if (i === subIndex) {
			if (subMode === 'text') {
				p.classList.add('highlight');
			} else {
				p.classList.add('blank');
			}
		}
		subDisplay.appendChild(p);
	});
	if (subIndex < subList.length && subIndex > 0) {
		subDisplay.scrollTop = document.querySelector(`#line-${subIndex}`).offsetTop;
	}
	srtOutput.textContent = '';
	srtList.forEach((block, i) => {
		let d = document.createElement('div');
		d.textContent = `${i+1}\n${block.start} --> ${block.end}\n${block.text}\n\n`;
		d.id = `srt-${i}`;
		if (i === subIndex) {
			if (subMode === 'text') {
				d.classList.add('highlight');
			} else {
				d.classList.add('blank');
			}
		}
		srtOutput.appendChild(d);
	});
	if (subIndex < subList.length && subIndex > 0) {
		subDisplay.scrollTop = document.querySelector(`#line-${subIndex}`).offsetTop;
		srtOutput.scrollTop = document.querySelector(`#srt-${subIndex}`).offsetTop;
	}
}

var isStarting = true;
document.onkeypress = function(e) {
	if (e.keyCode === 110) {
		// n pressed
		subIndex++;
		subMode = 'text';
		if (subIndex == subList.length) {
			document.onkeypress = null;
			srtList[subIndex - 1].end = formatTime(audioCtrl.currentTime);
		} else {
			// next line
			if (isStarting) {
				srtList[subIndex].start = formatTime(audioCtrl.currentTime);
				isStarting = false;
			} else {
				srtList[subIndex - 1].end = formatTime(audioCtrl.currentTime);
				srtList[subIndex].start = formatTime(audioCtrl.currentTime);
			}
		}
		refresh();
	} else if (e.keyCode === 98) {
		// b pressed
		subMode = 'blank';
		// hold
		srtList[subIndex].end = formatTime(audioCtrl.currentTime);
		isStarting = true;
		refresh();
	}
}

function formatTime(t) {
	let h = Math.floor(t / (3600*24)).toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});
	let m = Math.floor(t / 60).toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});
	let s = Math.floor(t % 60) .toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});
	return `${h}:${m}:${s},000`;
}