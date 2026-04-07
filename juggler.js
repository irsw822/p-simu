let status = "NONE";
let result = "NONE";
let btn;
let d_status;
let d_result;
let d_lamp;
let audioContext;
let audioBuffers = {};
let imageCache = {};

const imageFiles = {
	question: 'png/question.png',
	cross: 'png/cross.png',
	replay: 'png/replay.png',
	budo: 'png/budo.png',
	big: 'png/big.png',
	reg: 'png/reg.png',
	lamp_off: 'png/lamp_off.png',
	lamp_on: 'png/lamp_on.png',
};

const audioFiles = {
	bet: 'mp3/bet.mp3',
	start: 'mp3/1_start.mp3',
	stop: 'mp3/1_stop.mp3',
	replay: 'mp3/replay.mp3',
	budo: 'mp3/budo.mp3',
	gako: 'mp3/1_gako.mp3',
};

function preloadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

async function preloadAllImages() {
	const keys = Object.keys(imageFiles);
	for (const key of keys) {
		imageCache[key] = await preloadImage(imageFiles[key]);
		console.log(`${key} の画像プリロード完了`);
	}
}

async function loadAudioBuffer(url) {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	return await audioContext.decodeAudioData(arrayBuffer);
}

async function preloadAllAudio() {
	const keys = Object.keys(audioFiles);
	for (const key of keys) {
		audioBuffers[key] = await loadAudioBuffer(audioFiles[key]);
		console.log(`${key} の音声ファイルのプリロードが完了しました`);
	}
}

function playAudioBuffer(buffer) {
	if (!buffer) {
		console.warn('AudioBufferがありません');
		return;
	}
	const source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	source.start(0);
	return source;
}

function setResult() {
	result = "NONE";
	const num = Math.floor(Math.random() * 100);
	if (num < 5) {
		result = "BIG";
	} else if (num < 10) {
		result = "REG";
	} else if (num < 25) {
		result = "BUDO";
	} else if (num < 40) {
		result = "REPLAY";
	} else {
		result = "NONE";
	}
}

document.addEventListener('DOMContentLoaded', async function() {
	audioContext = new(window.AudioContext || window.webkitAudioContext)();
	btn = document.getElementById('id_button');
	d_status = document.getElementById('id_status');
	d_result = document.getElementById('id_result');
	d_lamp = document.getElementById('id_lamp');

	// 素材読み込みを行うためボタンはdisabledのまま
	btn.disabled = true;
	btn.style.pointerEvents = 'none';

	await preloadAllImages();
	await preloadAllAudio();


	// 全素材のプリロードが完了したらボタンを有効化
	btn.disabled = false;
	btn.style.pointerEvents = 'auto';

	btn.addEventListener('pointerdown', async() => {
		btn.classList.add('pressed');

		console.log(audioContext.state);
		// AudioContextはユーザー操作があるまでサスペンドされていることがあるのでresumeする
		if (audioContext.state === 'suspended') {
//			await new Promise(resolve => setTimeout(resolve, 1000)); // 待つ
			audioContext.resume();
			await new Promise(resolve => setTimeout(resolve, 2000)); // 待つ
			console.log('AudioContext resumed');
			alert("初回のタップ");
		}
		console.log(audioContext.state);

		
		
		if (status === "BET") {
			playAudioBuffer(audioBuffers.start);
			status = "STARTED";
			console.log("スタートします");
			d_result.src = imageCache.question.src;
			setResult();
		} else if (status === "STARTED") {
			playAudioBuffer(audioBuffers.stop);
			status = "PUSHED1";
			console.log("ボタン1をpushしました");
		} else if (status === "PUSHED1") {
			playAudioBuffer(audioBuffers.stop);
			status = "PUSHED2";
			console.log("ボタン2をpushしました");
		} else if (status === "PUSHED2") {
			playAudioBuffer(audioBuffers.stop);
			status = "PUSHED3";
			console.log("ボタン3をpushしました");

			if (result === "BUDO") {
				d_result.src = imageCache.budo.src;
				playAudioBuffer(audioBuffers.budo);
			} else if (result === "REPLAY") {
				d_result.src = imageCache.replay.src;
				playAudioBuffer(audioBuffers.replay);
			} else {
				d_result.src = imageCache.cross.src;
			}
		} else {
			alert("AudioContext state before play: " + audioContext.state);
			playAudioBuffer(audioBuffers.bet);
			status = "BET";
			console.log("BETしました");
		}
		d_status.textContent = status;
	});

	btn.addEventListener('pointerup', () => {
		if (status === "PUSHED3") {
			if ((result === "BIG") || (result === "REG")) {
				d_lamp.src = imageCache.lamp_on.src;
				playAudioBuffer(audioBuffers.gako);
			}
		}

		// 少しのあいだボタンを無効化しておく処理

		btn.classList.remove('pressed');
		btn.disabled = true;
		btn.style.pointerEvents = 'none';
		console.log('ボタンは無効化されました');

		setTimeout(function() {
			btn.disabled = false;
			btn.style.pointerEvents = 'auto';
			console.log('ボタンは有効化されました');
		}, 250); // 無効時間はここで調整(ミリ秒)
	});

	btn.addEventListener('pointercancel', () => {
		btn.classList.remove('pressed');
		console.log('pointercancel イベント発生');
	});
});
