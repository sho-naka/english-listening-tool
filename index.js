/* ---------- Speech Synthesis  ---------- */
const synth = speechSynthesis;
let enVoice = null;
function ensureVoice(cb) {
    const load = () => {
        const vs = synth.getVoices().filter((v) => /^en\b/i.test(v.lang));
        if (vs.length) {
            enVoice = vs[0];
            synth.removeEventListener("voiceschanged", load);
            cb();
        }
    };
    load();
    synth.addEventListener("voiceschanged", load);
}

/* ---------- helpers ---------- */
const speedEl = document.getElementById("speedSlider");
const speedVal = document.getElementById("speedVal");
speedEl.oninput = (e) =>
    (speedVal.textContent = parseFloat(e.target.value).toFixed(1));
const getRate = () => parseFloat(speedEl.value);

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
                speak(sentence);
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
                    try {
                        const r = await fetch(
                            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
                                sentence
                            )}&langpair=en|ja`
                        ).then((r) => r.json());
                        jp.textContent =
                            r.responseData.translatedText || "（取得失敗）";
                    } catch {
                        jp.textContent = "（取得失敗）";
                    }
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

/* ---------- speech ---------- */
function speak(txt) {
    ensureVoice(() => {
        synth.cancel();
        const ut = new SpeechSynthesisUtterance(txt);
        ut.voice = enVoice;
        ut.lang = enVoice.lang;
        ut.rate = getRate();
        synth.speak(ut);
    });
}

function playAll(isBlind) {
    const txt = document.getElementById("textInput").value.trim();
    if (!txt) return;
    ensureVoice(() => {
        synth.cancel();
        if (isBlind) doBlind();
        const ut = new SpeechSynthesisUtterance(
            txt.replace(/\s+/g, " ").trim()
        );
        ut.voice = enVoice;
        ut.lang = enVoice.lang;
        ut.rate = getRate();
        ut.onend = unBlind;
        synth.speak(ut);
    });
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
    playAll(false);
};
document.getElementById("blindPlayBtn").onclick = () => playAll(true);
document.getElementById("stopBtn").onclick = () => {
    synth.cancel();
    unBlind();
};

/* ---------- sample ---------- */
const SAMPLE =
    "Tom is hungry after work. He walks into a small noodle shop near the station. The cook smiles and says, “Good evening!” Tom looks at the menu on the wall. He chooses a bowl of chicken ramen and a green tea. While he waits, Tom checks his phone. Soon, the ramen arrives. It smells great, and Tom feels happy.";
document.getElementById("sampleBtn").onclick = () => {
    unBlind();
    synth.cancel();
    document.getElementById("textInput").value = SAMPLE;
    document.getElementById("list").innerHTML = "";
};