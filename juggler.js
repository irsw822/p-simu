let status = "NONE";
let result = "NONE";
let btn;
let d_status;
let d_result =[];
let d_lamp;
let audioContext;
let audioBuffers = {};
let imageCache = {};
let isBigBonus = false;
let isRegularBonus = false;
let currentAudioSource = null;
let currentAudioKey = null;  // どの音声を再生中かを記録
let imagePattern;

const imageFiles = {
	question: 'png/question.png',
	roll1: 'png/roll1.png',
	roll2: 'png/roll2.png',
	roll3: 'png/roll3.png',
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

const imagePatternLose = [
	["budo", "budo", "replay"],
	["budo", "budo", "big"],
	["budo", "budo", "reg"],
	["replay", "replay", "budo"],
	["replay", "replay", "big"],
	["replay", "replay", "reg"],
	["budo", "replay", "budo"],
	["budo", "replay", "replay"],
	["budo", "replay", "big"],
	["budo", "replay", "reg"],
	["replay", "budo", "budo"],
	["replay", "budo", "replay"],
	["replay", "budo", "big"],
	["replay", "budo", "reg"],

];

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
	// リールパターンを"回転中"に設定
	d_result[0].src = imageCache.roll1.src;
	d_result[1].src = imageCache.roll2.src;
	d_result[2].src = imageCache.roll3.src;

	// Bonus確定状態とそれ以外で抽選処理を変える
	if( isBigBonus ){
		imagePattern = ["big", "big", "big"];
	} else if ( isRegularBonus ) {
		imagePattern = ["big", "big", "reg"];	
	} else {
		result = "NONE";
		d_lamp.src = imageCache.lamp_off.src;

		// リールパターンを初期化
		const pattern = Math.floor(Math.random() * imagePatternLose.length);
		imagePattern = imagePatternLose[pattern];
		
		const num = Math.floor(Math.random() * 100);
		if (num < 5) {
			result = "BIG";
		} else if (num < 10) {
			result = "REG";
		} else if (num < 25) {
			result = "BUDO";
			imagePattern = ["budo", "budo", "budo"]; // リールパターンを子役で上書き
		} else if (num < 40) {
			result = "REPLAY";
			imagePattern = ["replay", "replay", "replay"]; // リールパターンを子役で上書き
		} else {
			result = "NONE";
		}

		
	}
}

document.addEventListener('DOMContentLoaded', async function() {

	const loadingDiv = document.getElementById('loading');
	
	audioContext = new(window.AudioContext || window.webkitAudioContext)();
	btn = document.getElementById('id_button');
	d_status = document.getElementById('id_status');
	d_result[0] = document.getElementById('id_result1');
	d_result[1] = document.getElementById('id_result2');
	d_result[2] = document.getElementById('id_result3');
	d_lamp = document.getElementById('id_lamp');

	// 素材読み込みを行うためボタンはdisabledのまま
	btn.disabled = true;
	btn.style.pointerEvents = 'none';

	// 素材のプリロード
	await preloadAllImages();
	await preloadAllAudio();
	console.log("素材のプリロード完了");

	// 読み込み中表示を消す
  	loadingDiv.style.display = 'none';
	
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
			d_status.textContent = "STARTED";
			console.log("スタートします");
			setResult();
		} else if (status === "STARTED") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED1";
			console.log("ボタン1をpushしました");
			d_result[0].src = imageCache[imagePattern[0]].src;
		} else if (status === "PUSHED1") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED2";
			console.log("ボタン2をpushしました");
			d_result[1].src = imageCache[imagePattern[1]].src;
			if(isBigBonus || isRegularBonus){
				playAudioBuffer(audioBuffers.reach, 'playngReach');
			}
		} else if (status === "PUSHED2") {
			playAudioBuffer(audioBuffers.stop, 'playngStop');
			status = "PUSHED3";
			console.log("ボタン3をpushしました");
			d_result[2].src = imageCache[imagePattern[2]].src;

			if ( isBigBonus ) {
//				d_result.src = imageCache.big.src;
				playAudioBuffer(audioBuffers.big, 'playngBig');
				isBigBonus = false;
				d_status.textContent = "Big Bonus!!";
				result = "NONE";
			} else if ( isRegularBonus ) {
//				d_result.src = imageCache.reg.src;
				playAudioBuffer(audioBuffers.reg, 'playngReg');
				isRegularBonus = false;
				d_status.textContent = "Regular Bonus!";
				result = "NONE";
			} else if (result === "BUDO") {
				playAudioBuffer(audioBuffers.budo, 'playngBudo');
				d_status.textContent = "ぶどうget!";
			} else if (result === "REPLAY") {
				playAudioBuffer(audioBuffers.replay, 'playngReplay');
				d_status.textContent = "REPLAY!";
			} else {
				d_status.textContent = "ー";
			}
		} else {
			playAudioBuffer(audioBuffers.bet, 'playngBet');
			status = "BET";
			console.log("BETしました");
			d_status.textContent = "BET";
		}
		
	});

	// ボタンを離した時の処理
	btn.addEventListener('pointerup', () => {
		if (status === "PUSHED3") {
			// ボーナスを引いていた場合の処理
			if (result === "BIG") {
				playAudioBuffer(audioBuffers.gako, 'playngGako');
				d_lamp.src = imageCache.lamp_on.src;
				isBigBonus = true;
			} else if (result === "REG") {
				playAudioBuffer(audioBuffers.gako, 'playngGako');
				d_lamp.src = imageCache.lamp_on.src;
				isRegularBonus = true;				
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
