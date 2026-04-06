let status = "NONE";
let result = "NONE";

const audioFiles = {
  gako: 'mp3/gako.mp3',
  bet: 'mp3/bet.mp3',
  start: 'mp3/start.mp3',
  stop: 'mp3/stop.mp3',
  replay: 'mp3/replay.mp3',
  budo: 'mp3/budo.mp3',
};

let audioContext;
let audioBuffers = {};

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

document.addEventListener('DOMContentLoaded', async function () {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const btn = document.getElementById('id_button');
  const txt = document.getElementById('id_status');
  const result = document.getElementById('id_result');

  // ここでボタンはdisabledのまま
  btn.disabled = true;

  await preloadAllAudio();

  // すべての音声ファイルのプリロードが完了したらボタンを有効化
  btn.disabled = false;

  btn.addEventListener('pointerdown', () => {
    btn.classList.add('pressed');

    // AudioContextはユーザー操作があるまでサスペンドされていることがあるのでresumeする
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (status === "BET") {
      playAudioBuffer(audioBuffers.start);
      status = "STARTED";
      console.log("スタートします");
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
        playAudioBuffer(audioBuffers.budo);
        alert("ぶどうget");
      } else if (result === "REPLAY") {
        playAudioBuffer(audioBuffers.replay);
        alert("リプレイget");
      }
    } else {
      playAudioBuffer(audioBuffers.bet);
      status = "BET";
      console.log("BETしました");
    }
    txt.textContent = status;
  });

  btn.addEventListener('pointerup', () => {
    btn.classList.remove('pressed');
    if (status === "PUSHED3") {
      if ((result === "BIG") || (result === "REG")) {
        playAudioBuffer(audioBuffers.gako);
        alert("ガコッ！");
      }
    }
  });

  btn.addEventListener('pointercancel', () => {
    btn.classList.remove('pressed');
    console.log('pointercancel イベント発生');
  });
});
