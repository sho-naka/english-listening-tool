// js/translationService.js

/**
 * 翻訳API呼び出しをまとめたサービスクラス
 */
export class TranslationService {
    /**
     * 英文を和訳して返す
     * @param {string} text 英文
     * @returns {Promise<string>} 日本語訳
     */
    async translate(text) {
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            text
          )}&langpair=en|ja`
        );
        const data = await res.json();
        return data.responseData.translatedText || "（取得失敗）";
      } catch {
        return "（取得失敗）";
      }
    }
  }
  
  /**
   * singleton インスタンス
   * @type {TranslationService}
   */
  export const translationService = new TranslationService();
  