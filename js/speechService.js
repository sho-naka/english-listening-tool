/**
 * Speech Synthesis を扱うサービスクラス
 * @module speechService
 */
export class SpeechService {
    /**
     * @constructor
     */
    constructor() {
        /**
         * ブラウザの SpeechSynthesis インスタンス
         * @type {SpeechSynthesis}
         */
        this.synth = window.speechSynthesis;
        /**
         * 選択された英語音声
         * @type {SpeechSynthesisVoice|null}
         */
        this.enVoice = null;
    }

    /**
     * 英語用の音声がロードされるまで待機し、ロード後にコールバックを実行する。
     * @param {Function} cb - 音声取得後に実行する関数
     */
    ensureVoice(cb) {
        const load = () => {
            const voices = this.synth.getVoices().filter(v => /^en\b/i.test(v.lang));
            if (voices.length) {
                this.enVoice = voices[0];
                this.synth.removeEventListener('voiceschanged', load);
                cb();
            }
        };
        load();
        this.synth.addEventListener('voiceschanged', load);
    }

    /**
     * 単一文を読み上げる。
     * @param {string} text - 読み上げたい文
     * @param {number} rate - 読み上げ速度
     */
    speakSentence(text, rate) {
        this.ensureVoice(() => {
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.enVoice;
            utterance.lang = this.enVoice.lang;
            utterance.rate = rate;
            this.synth.speak(utterance);
        });
    }

    /**
     * 全文を読み上げる。
     * @param {string} text     - 読み上げたい全文
     * @param {number} rate     - 読み上げ速度
     * @param {Function} onEnd  - 再生終了時コールバック
     */
    playAllText(text, rate, onEnd = () => { }) {
        this.ensureVoice(() => {
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, ' ').trim());
            utterance.voice = this.enVoice;
            utterance.lang = this.enVoice.lang;
            utterance.rate = rate;
            utterance.onend = onEnd;
            this.synth.speak(utterance);
        });
    }
}

/**
 * SpeechService のインスタンス
 * @type {SpeechService}
 */
export const speechService = new SpeechService();
