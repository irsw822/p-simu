let status = "NONE";
let result = "NONE";
let audio_gako = new Audio('mp3/gako.mp3');
let audio_bet = new Audio('mp3/bet.mp3');
let audio_start = new Audio('mp3/start.mp3');
let audio_stop = new Audio('mp3/stop.mp3');
let audio_replay = new Audio('mp3/replay.mp3');
let audio_budo = new Audio('mp3/budo.mp3');

function setResult() {
	result = "NONE";
	num = Math.floor(Math.random() * 100);
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


document.addEventListener('DOMContentLoaded', function () {
	audio_bet.preload = 'auto';
	audio_bet.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});

	audio_start.preload = 'auto';
	audio_start.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});

	audio_stop.preload = 'auto';
	audio_stop.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});
	
	audio_gako.preload = 'auto';
	audio_gako.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});


	audio_budo.preload = 'auto';
	audio_budo.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});

	audio_replay.preload = 'auto';
	audio_replay.addEventListener('canplaythrough', () => {
		console.log('音声ファイルのプリロードが完了しました');
	});

	
	btn = document.getElementById('id_button');
	txt = document.getElementById('id_text');
		
	btn.addEventListener('pointerdown', () => {
		btn.classList.add('pressed');
		if (status === "BET") {
			audio_start.play();
			status = "STARTED"
			console.log("スタートします");
			setResult();
		} else if (status === "STARTED") {
			audio_stop.play();
			status = "PUSHED1"
			console.log("ボタン1をpushしました");
		} else if (status === "PUSHED1") {
			audio_stop.play();
			status = "PUSHED2"
			console.log("ボタン2をpushしました");
		} else if (status === "PUSHED2") {
			audio_stop.play();
			status = "PUSHED3"
			console.log("ボタン3をpushしました");

			if (result === "BUDO") {
				//console.log("ぶどうget");
				audio_budo.play();
				alert("ぶどうget");
			} else if (result === "REPLAY") {
				//console.log("リプレイget");    
				audio_replay.play();
				alert("リプレイget");
			}

			
		} else {
			audio_bet.play();
			status = "BET"
			console.log("BETしました");
		}
		txt.textContent = status;
	});
	
	btn.addEventListener('pointerup', () => {
		btn.classList.remove('pressed');
		if (status === "PUSHED3") {
			if ((result === "BIG") || (result === "REG")) {
				//console.log("ガコッ！");  
				audio_gako.play();
				alert("ガコッ！");
			}
		}
	});
	
	btn.addEventListener('pointercancel', () => {
		btn.classList.remove('pressed');
		console.log('pointercancel イベント発生');
	});

});
