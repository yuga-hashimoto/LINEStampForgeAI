import type { StickerCount } from "@/lib/types";

export type RecentProject = {
  id: string;
  name: string;
  statusLabel: string;
  statusTone: "line" | "green" | "zinc";
  stickerCount: StickerCount;
  updatedAt: string;
  progress: string;
};

export type TemplateSet = {
  id: string;
  name: string;
  description: string;
  stickerCount: StickerCount;
  category: string;
  phrases: string[];
};

export type HelpFaq = {
  question: string;
  answer: string;
};

export type ProductUpdate = {
  date: string;
  title: string;
  description: string;
};

export const appMetrics = [
  { label: "今月の生成クレジット", value: "台帳連携済み", helper: "APIで消費を記録" },
  { label: "書き出し可能セット", value: "台帳連携済み", helper: "申請パック発行時に消費" },
  { label: "自動チェック通過", value: "12 / 12", helper: "デモプロジェクト" },
  { label: "ZIPサイズ目安", value: "3.2MB", helper: "60MB以内" },
];

export const recentProjects: RecentProject[] = [
  {
    id: "magic-rabbit-vol-1",
    name: "魔法うさぎスタンプ Vol.1",
    statusLabel: "レビュー前",
    statusTone: "line",
    stickerCount: 24,
    updatedAt: "2026-05-04",
    progress: "スタンプセット生成まで完了",
  },
  {
    id: "cafe-cat-draft",
    name: "カフェねこ接客スタンプ",
    statusLabel: "下書き",
    statusTone: "zinc",
    stickerCount: 16,
    updatedAt: "2026-05-03",
    progress: "企画入力を保存済み",
  },
  {
    id: "shop-fox-export",
    name: "店舗用きつね告知なしセット",
    statusLabel: "書き出し済み",
    statusTone: "green",
    stickerCount: 32,
    updatedAt: "2026-05-02",
    progress: "Creators Market用ZIPを作成済み",
  },
];

export const templateSets: TemplateSet[] = [
  {
    id: "daily-24",
    name: "日常会話 24個",
    description: "あいさつ、感謝、謝罪、応援、報告をバランスよく含む標準セット。",
    stickerCount: 24,
    category: "個人クリエイター",
    phrases: ["おはよう", "ありがとう", "了解です", "おつかれさま", "またね", "承知です"],
  },
  {
    id: "work-16",
    name: "仕事連絡 16個",
    description: "制作代行や店舗アカウントで使いやすい短文返信セット。",
    stickerCount: 16,
    category: "店舗・法人",
    phrases: ["確認します", "共有します", "完了です", "後で送ります", "予定あります", "助かります"],
  },
  {
    id: "soft-care-8",
    name: "やさしい気遣い 8個",
    description: "小さく試すための気遣い・励まし中心テンプレート。",
    stickerCount: 8,
    category: "お試し",
    phrases: ["大丈夫？", "無理せずに", "休憩しよう", "がんばって", "ファイト！", "また明日"],
  },
  {
    id: "full-40",
    name: "販売前フル 40個",
    description: "シリーズ化を見据えた、用途重複を抑えた40個構成。",
    stickerCount: 40,
    category: "本格販売",
    phrases: ["こんにちは", "こんばんは", "すみません", "最高！", "いいね", "よろしくお願いします"],
  },
];

export const helpFaqs: HelpFaq[] = [
  {
    question: "このサービスはLINE公式サービスですか？",
    answer:
      "いいえ。本サービスはLINE公式サービスではありません。Creators Market向けの制作補助UIとして提供しています。",
  },
  {
    question: "審査通過は保証されますか？",
    answer:
      "保証されません。サイズ、形式、透過、余白、視認性などの事前チェックは支援しますが、最終判断は各マーケットの審査に従います。",
  },
  {
    question: "生成回数や書き出し数に上限はありますか？",
    answer:
      "あります。単発売りは含まれる再生成回数、月額プランは月間書き出し数と生成クレジット数を明示しています。",
  },
  {
    question: "AI生成コンテンツの表示には対応していますか？",
    answer:
      "AI生成またはAI補助で作られたコンテンツとして扱われる可能性がある旨を、画面と書き出し用manifestに残せる設計です。",
  },
];

export const productUpdates: ProductUpdate[] = [
  {
    date: "2026-05-04",
    title: "Auth・決済・利用量の接続口を追加",
    description: "Clerk Auth、Stripe Checkout、利用量台帳、申請パック発行時の書き出し消費を追加しました。",
  },
  {
    date: "2026-05-03",
    title: "画像生成ジョブAPIの土台を追加",
    description: "Codex app-serverのimagegenをworkerから扱うため、ジョブ作成APIとworker境界を用意しました。",
  },
  {
    date: "2026-05-02",
    title: "制作ダッシュボードMVP",
    description: "スタンプ数切り替え、文字モード、自動チェック、ダミーZIP書き出しを実装しました。",
  },
];

export const productionChecklist = [
  "LPから登録・ログイン・デモ・料金・規約へ到達できる",
  "Clerk設定時は外部Auth、未設定時は開発デモとして動く",
  "Stripe Checkout Sessionsとwebhookの接続口がある",
  "生成ジョブと申請パック発行で利用量台帳を消費する",
  "アプリ内ホームからプロジェクト一覧とデモ編集画面へ遷移できる",
  "利用規約、プライバシーポリシー、特商法表記のページを用意している",
  "Creators Market向けの注意事項と非公式サービス表記を複数箇所で明示している",
  "主要フォームは入力バリデーションと成功toastを返す",
  "ZIP書き出しはmanifest.json入りのダミーZIPをダウンロードできる",
];
