let status = "NONE";
let result = "NONE";
let btn;
let d_status;
let d_result;
let d_lamp;
let audioContext;
let audioBuffers = {};
let imageCache = {};
let isBonusGame = false;
let currentAudioSource = null;
let currentAudioKey = null;  // どの音声を再生中かを記録

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
	reach: 'mp3/reach.mp3',
	big: 'mp3/big.mp3',
	reg: 'mp3/reg.mp3',
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
		//console.log(`${key} の画像プリロード完了`);
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
		//console.log(`${key} の音声ファイルのプリロードが完了しました`);
	}
}
/*
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
*/

// 音声再生の途中終了対応版
function playAudioBuffer(buffer, key) {
	if (!buffer) {
		console.warn('AudioBufferがありません');
		return null;
	}
	const source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	source.start(0);

	// 再生終了時にcurrentAudioSourceをクリア
	source.onended = () => {
		if (currentAudioSource === source) {
			currentAudioSource = null;
			currentAudioKey = null;
		}
	};

	currentAudioSource = source;
	currentAudioKey = key;

	return source;
}

function setResult() {
	if( !isBonusGame ){
		result = "NONE";
		d_result.src = imageCache.question.src;
		d_lamp.src = imageCache.lamp_off.src;
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

	// 素材のプリロード
	await preloadAllImages();
	await preloadAllAudio();
	console.log("素材のプリロード完了");

	// 全素材のプリロードが完了したらボタンを有効化
	btn.disabled = false;
	btn.style.pointerEvents = 'auto';

	// ボタンを押した時の処理
	btn.addEventListener('pointerdown', async() => {
		btn.classList.add('pressed');

		// AudioContextはユーザー操作があるまでサスペンドされていることがあるのでresumeする
		if (audioContext.state === 'suspended') {
			// resume処理は前提としてボタン押下イベントを待つ必要がある。ブラウザにボタン押下イベントを確実に認識させるため少し待つ。
			await new Promise(resolve => setTimeout(resolve, 100));
			await audioContext.resume();
		}

		// Bonus音がなっている場合、強制停止停止する。
		if (( currentAudioKey === 'playngBig' && currentAudioSource) || ( currentAudioKey === 'playngReg' && currentAudioSource )) {
			currentAudioSource.stop();
			currentAudioSource = null;
			currentAudioKey = null;
			console.log('Bonus音の再生を停止しました');
		}

		if (status === "BET") {
			playAudioBuffer(audioBuffers.start, 'playngStart');
			status = "STARTED";
			console.log("スタートします");
			setResult();
		} else if (status === "STARTED") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED1";
			console.log("ボタン1をpushしました");
		} else if (status === "PUSHED1") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED2";
			console.log("ボタン2をpushしました");
			if(isBonusGame){
				playAudioBuffer(audioBuffers.reach, 'playngReach');
			}
		} else if (status === "PUSHED2") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED3";
			console.log("ボタン3をpushしました");

			if ((result === "BIG") && isBonusGame ) {
				d_result.src = imageCache.big.src;
				playAudioBuffer(audioBuffers.big, 'playngBig');
				isBonusGame = false;
				result = "NONE";
			} else if ((result === "REG") && isBonusGame ) {
				d_result.src = imageCache.reg.src;
				playAudioBuffer(audioBuffers.reg, 'playngReg');
				isBonusGame = false;
				result = "NONE";
			} else if (result === "BUDO") {
				d_result.src = imageCache.budo.src;
				playAudioBuffer(audioBuffers.budo, 'playngBudo');
			} else if (result === "REPLAY") {
				d_result.src = imageCache.replay.src;
				playAudioBuffer(audioBuffers.replay, 'playngReplay');
			} else {
				d_result.src = imageCache.cross.src;
			}
		} else {
			playAudioBuffer(audioBuffers.bet, 'playngBet');
			status = "BET";
			console.log("BETしました");
		}
		d_status.textContent = status;
	});

	// ボタンを離した時の処理
	btn.addEventListener('pointerup', () => {
		if (status === "PUSHED3") {
			if ((result === "BIG") || (result === "REG")) {
				playAudioBuffer(audioBuffers.gako, 'playngGako');
				d_lamp.src = imageCache.lamp_on.src;
				isBonusGame = true;
			}
		}

		// 連打を避けるために一瞬ボタンを無効化しておく処理
		btn.disabled = true;
		btn.style.pointerEvents = 'none';
		setTimeout(function() {
			btn.classList.remove('pressed');
			btn.disabled = false;
			btn.style.pointerEvents = 'auto';
		}, 150); // 無効時間はここで調整(ミリ秒)
	});

	btn.addEventListener('pointercancel', () => {
		btn.classList.remove('pressed');
		console.log('pointercancel イベント発生');
	});
});
