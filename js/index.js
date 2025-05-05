import { speechService } from './speechService.js';
import { translationService } from './translationService.js';

/* ---------- helpers ---------- */
let speechRate = 1.0;
document.querySelectorAll(".speed-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        // 選択中のボタンをハイライト
        document.querySelectorAll(".speed-btn")
            .forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        // data-rate 属性から数値を取得
        speechRate = parseFloat(btn.dataset.rate);
    });
});

function splitSentences(t) {
    return (
        t.match(/[^.?!]+(?:[.?!]+|$)/g) || []
    )
        .map((s) => s.trim().replace(/^[\s"'”“]+/, ""))
        .filter(Boolean);
}

/* ---------- build list ---------- */
function buildList() {
    unBlind();
    const ul = document.getElementById("list");
    ul.innerHTML = "";
    splitSentences(document.getElementById("textInput").value).forEach(
        (sentence) => {
            const li = document.createElement("li");
            li.className = "s-item";

            const p = document.createElement("button");
            p.textContent = "🔊";
            p.className = "spk";
            p.onclick = () => {
                unBlind();
                speechService.speakSentence(sentence, speechRate);
            };

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
                jp.style.display =
                  jp.style.display === "inline" ? "none" : "inline";
              };

            li.append(p, t, document.createTextNode(sentence), jp);
            ul.appendChild(li);
        }
    );
}

/* ---------- blind mode ---------- */
let blindOn = false;
function doBlind() {
    document.getElementById("textInput").classList.add("blind");
    document.getElementById("sentenceArea").classList.add("blind");
    blindOn = true;
}
function unBlind() {
    if (blindOn) {
        document.getElementById("textInput").classList.remove("blind");
        document.getElementById("sentenceArea").classList.remove("blind");
        blindOn = false;
    }
}

/* ---------- events ---------- */
document.getElementById("makeBtn").onclick = buildList;
document.getElementById("playAllBtn").onclick = () => {
    unBlind();
    const text = document.getElementById("textInput").value.trim();
    if (!text) return;
    speechService.playAllText(text, speechRate, unBlind);
};
document.getElementById("blindPlayBtn").onclick = () => {
    const text = document.getElementById("textInput").value.trim();
    if (!text) return;
    doBlind();
    speechService.playAllText(text, speechRate, unBlind);
}
document.getElementById("stopBtn").onclick = () => {
    speechService.synth.cancel();
    unBlind();
};

/* ---------- sample ---------- */
const SAMPLE =
    "Tom is hungry after work. He walks into a small noodle shop near the station. The cook smiles and says, “Good evening!” Tom looks at the menu on the wall. He chooses a bowl of chicken ramen and a green tea. While he waits, Tom checks his phone. Soon, the ramen arrives. It smells great, and Tom feels happy.";
document.getElementById("sampleBtn").onclick = () => {
    unBlind();
    speechService.synth.cancel();
    document.getElementById("textInput").value = SAMPLE;
    document.getElementById("list").innerHTML = "";
};