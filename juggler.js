let status = "NONE";
let result = "NONE";

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

btn = document.getElementById('id_button');
txt = document.getElementById('id_text');

btn.addEventListener('pointerdown', () => {
	btn.classList.add('pressed');
	if (status === "BET") {
		status = "STARTED"
		console.log("スタートします");
		setResult();
	} else if (status === "STARTED") {
		status = "PUSHED1"
		console.log("ボタン1をpushしました");
	} else if (status === "PUSHED1") {
		status = "PUSHED2"
		console.log("ボタン2をpushしました");
	} else if (status === "PUSHED2") {
		status = "PUSHED3"
		console.log("ボタン3をpushしました");
	} else {
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
			alert("ガコッ！");
		} else if (result === "BUDO") {
			//console.log("ぶどうget");    
			alert("ぶどうget");
		} else if (result === "REPLAY") {
			//console.log("リプレイget");    
			alert("リプレイget");
		}
	}
});

btn.addEventListener('pointercancel', () => {
	btn.classList.remove('pressed');
	console.log('pointercancel イベント発生');
});
