import {
  characterMotionOptions,
  phraseTemplateTexts,
  speechColorOptions,
  speechShapeOptions,
  speechStyleOptions,
} from "@/lib/constants";
import type { StickerCount, StickerDirection } from "@/lib/types";

const themePhrasePresets: Array<{
  keywords: string[];
  phrases: string[];
}> = [
  {
    keywords: ["店舗", "店", "接客", "予約", "ショップ", "サロン", "カフェ"],
    phrases: [
      "いらっしゃいませ",
      "ありがとうございます",
      "確認します",
      "少々お待ちください",
      "承知しました",
      "予約できます",
      "完了しました",
      "またお待ちしています",
      "本日もよろしくお願いします",
      "おすすめです",
      "準備できました",
      "お気軽にどうぞ",
    ],
  },
  {
    keywords: ["家族", "夫婦", "子ども", "親子", "家庭"],
    phrases: [
      "おはよう",
      "いってきます",
      "いってらっしゃい",
      "ただいま",
      "おかえり",
      "ごはんできたよ",
      "あとでね",
      "気をつけて",
      "大丈夫？",
      "ありがとう",
      "おつかれさま",
      "おやすみ",
    ],
  },
  {
    keywords: ["推し", "配信", "ファン", "応援", "ライブ"],
    phrases: [
      "最高！",
      "いいね",
      "ファイト！",
      "応援してる",
      "尊い",
      "待ってました",
      "おめでとう",
      "すごい！",
      "やったー！",
      "無理せずに",
      "共有します",
      "またね",
    ],
  },
  {
    keywords: ["仕事", "業務", "チーム", "社内", "連絡"],
    phrases: [
      "承知しました",
      "確認します",
      "ありがとうございます",
      "助かります",
      "共有します",
      "後で送ります",
      "完了です",
      "少々お待ちください",
      "予定あります",
      "もう一回お願いします",
      "よろしくお願いします",
      "おつかれさまです",
    ],
  },
];

export function createStickerDirectionsFromTheme(input: {
  theme: string;
  stickerCount: StickerCount;
  currentDirections: StickerDirection[];
}) {
  const theme = input.theme.trim();
  const preset = themePhrasePresets.find((candidate) =>
    candidate.keywords.some((keyword) => theme.includes(keyword))
  );
  const basePhrases = preset?.phrases ?? phraseTemplateTexts;
  const phrases = Array.from({ length: input.stickerCount }, (_, index) => {
    return basePhrases[index] ?? phraseTemplateTexts[index % phraseTemplateTexts.length];
  });

  return phrases.map((phrase, index): StickerDirection => {
    const current = input.currentDirections[index];
    const motion = chooseMotion(theme, phrase, index);
    const emotion = chooseEmotion(phrase, index);
    const speechShape = speechShapeOptions[index % speechShapeOptions.length];
    const speechStyle = speechStyleOptions[(index + 1) % speechStyleOptions.length];
    const textColor = speechColorOptions[index % speechColorOptions.length].value;

    return {
      id: index + 1,
      text: phrase,
      emotion,
      pose: motion,
      prop: current?.prop ?? chooseProp(phrase, index),
      textColor,
      speechShape,
      speechStyle,
      characterMotion: motion,
      directionNote: `${theme || "日常会話"}のテーマに合わせて、${emotion}が一目で伝わる表情。文字は大きく、1コマ内に収める。`,
    };
  });
}

function chooseMotion(theme: string, phrase: string, index: number) {
  if (phrase.includes("おめでとう") || phrase.includes("やった")) return "クラッカーを鳴らす";
  if (phrase.includes("いって") || phrase.includes("また")) return "手を振る";
  if (phrase.includes("確認") || phrase.includes("共有") || phrase.includes("送ります")) return "胸に手を当てる";
  if (phrase.includes("待")) return "耳を下げる";
  if (phrase.includes("ありがとう") || phrase.includes("助か")) return "おじぎ";
  if (phrase.includes("ファイト") || phrase.includes("応援")) return "ジャンプ";
  if (theme.includes("魔法")) return "杖を振る";

  return characterMotionOptions[index % characterMotionOptions.length];
}

function chooseEmotion(phrase: string, index: number) {
  if (phrase.includes("ありがとう") || phrase.includes("助か")) return "感謝";
  if (phrase.includes("ごめ") || phrase.includes("すみません")) return "反省";
  if (phrase.includes("大丈夫") || phrase.includes("無理せず")) return "心配";
  if (phrase.includes("おめでとう") || phrase.includes("やった")) return "祝福";
  if (phrase.includes("確認") || phrase.includes("承知")) return "丁寧";
  if (phrase.includes("最高") || phrase.includes("すごい")) return "驚き";

  return ["元気", "笑顔", "安心", "応援", "柔らかい"][index % 5];
}

function chooseProp(phrase: string, index: number) {
  if (phrase.includes("おめでとう") || phrase.includes("やった")) return "🎉";
  if (phrase.includes("確認") || phrase.includes("承知")) return "✅";
  if (phrase.includes("待")) return "⏳";
  if (phrase.includes("ありがとう")) return "💛";
  if (phrase.includes("ファイト") || phrase.includes("応援")) return "⭐";

  return ["✨", "💬", "☀️", "🌙", "💗"][index % 5];
}
