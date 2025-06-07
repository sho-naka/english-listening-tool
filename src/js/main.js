import { UIController } from './UIController.js';

const uiController = new UIController();

const userInput = document.getElementById('textInput');
const playAllBtn = document.getElementById('playAllBtn');
const stopBtn = document.getElementById('stopBtn');
const speedRadios = document.querySelectorAll('input[name="speed"]');
const makeBtn = document.getElementById('makeBtn');
const list = document.getElementById('list');

// 音声合成
const synth = window.speechSynthesis;

// 再生ボタン押下時に英文を読み上げる
playAllBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;
    let rate = 1.0;
    // idで判定して速度を決定
    if (document.getElementById('speedSlow').checked) {
        rate = 0.8;
    } else if (document.getElementById('speedNormal').checked) {
        rate = 1.0;
    }
    if (synth.speaking) synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.lang = 'en-US';
    synth.speak(utter);
});

// 停止ボタンで読み上げ停止
stopBtn.addEventListener('click', () => {
    if (synth.speaking) synth.cancel();
});

// 文リスト作成ボタン押下時の処理
makeBtn.addEventListener('click', () => uiController.buildList());