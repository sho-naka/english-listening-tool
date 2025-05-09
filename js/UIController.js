import { speechService } from './speechService.js';
import { translationService } from './translationService.js';

export class UIController {
    constructor() {
        this.speechRate = 1.0;
        this.blindOn = false;
        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll(".speed-btn").forEach(btn => {
            btn.addEventListener("click", () => this.changeSpeechRate(btn));
        });

        document.getElementById("makeBtn").onclick = () => this.buildList();
        document.getElementById("playAllBtn").onclick = () => this.playAll();
        document.getElementById("blindPlayBtn").onclick = () => this.blindPlay();
        document.getElementById("stopBtn").onclick = () => this.stopSpeech();
        document.getElementById("sampleBtn").onclick = () => this.loadSample();
    }

    changeSpeechRate(btn) {
        document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.speechRate = parseFloat(btn.dataset.rate);
    }

    splitSentences(text) {
        return (
            text.match(/[^.?!]+(?:[.?!]+|$)/g) || []
        )
            .map((s) => s.trim().replace(/^[\s"'”“]+/, ""))
            .filter(Boolean);
    }

    buildList() {
        this.unBlind();
        const ul = document.getElementById("list");
        ul.innerHTML = "";
        this.splitSentences(document.getElementById("textInput").value).forEach(
            (sentence) => {
                const li = document.createElement("li");
                li.className = "list-group-item";

                const sItem = document.createElement("div");
                sItem.className = "s-item";

                // 英文
                const en = document.createElement("span");
                en.className = "en";
                en.textContent = sentence;

                // ボタンエリア
                const btnArea = document.createElement("div");
                btnArea.className = "btn-area";

                // 再生ボタン
                const p = document.createElement("button");
                p.textContent = "再生";
                p.className = "spk";
                p.onclick = () => {
                    this.unBlind();
                    speechService.speakSentence(sentence, this.speechRate);
                };

                // 訳ボタン
                const t = document.createElement("button");
                t.textContent = "訳";
                t.className = "trn";
                const jp = document.createElement("span");
                jp.className = "jp";
                t.onclick = async () => {
                    if (!jp.textContent) {
                        t.disabled = true;
                        t.textContent = "…";
                        jp.textContent = await translationService.translate(sentence);
                        t.disabled = false;
                        t.textContent = "訳";
                    }
                    jp.classList.toggle("active");
                };

                btnArea.appendChild(p);
                btnArea.appendChild(t);

                sItem.appendChild(en);
                sItem.appendChild(btnArea);
                sItem.appendChild(jp);

                li.appendChild(sItem);
                ul.appendChild(li);
            }
        );
    }

    doBlind() {
        document.getElementById("textInput").classList.add("blind");
        document.getElementById("sentenceArea").classList.add("blind");
        this.blindOn = true;
    }

    unBlind() {
        if (this.blindOn) {
            document.getElementById("textInput").classList.remove("blind");
            document.getElementById("sentenceArea").classList.remove("blind");
            this.blindOn = false;
        }
    }

    playAll() {
        this.unBlind();
        const text = document.getElementById("textInput").value.trim();
        if (!text) return;
        speechService.playAllText(text, this.speechRate, () => this.unBlind());
    }

    blindPlay() {
        const text = document.getElementById("textInput").value.trim();
        if (!text) return;
        this.doBlind();
        speechService.playAllText(text, this.speechRate, () => this.unBlind());
    }

    stopSpeech() {
        speechService.synth.cancel();
        this.unBlind();
    }

    loadSample() {
        this.unBlind();
        speechService.synth.cancel();
        document.getElementById("textInput").value = SAMPLE;
        document.getElementById("list").innerHTML = "";
    }
}

const SAMPLE =
    "Tom is hungry after work. He walks into a small noodle shop near the station. The cook smiles and says, “Good evening!” Tom looks at the menu on the wall. He chooses a bowl of chicken ramen and a green tea. While he waits, Tom checks his phone. Soon, the ramen arrives. It smells great, and Tom feels happy.";