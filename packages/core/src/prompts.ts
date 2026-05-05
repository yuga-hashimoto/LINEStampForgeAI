import {
  getCharacterSheetAssetPath,
  getCharacterSheetPromptPath,
  getRegeneratedCellAssetPath,
  getRegeneratedCellPromptPath,
  getStickerSheetAssetPath,
  getStickerSheetPromptPath,
} from "./paths";
import { renderTemplate, sanitizePromptValue } from "./prompt-utils";
import type {
  GenerateCharacterSheetInput,
  GenerateStickerSheetInput,
  RegenerateStickerCellInput,
} from "./types";

export const characterSheetCodexPromptTemplate = `
$imagegen

あなたはLINEスタンプ用キャラクターの参照画像を作る専門家です。
目的は、後続のスタンプ画像生成AIが同じキャラクターを安定して再現できるように、
「文字なしのキャラクタースタイルシート画像」を1枚で作ることです。

# 出力ファイル
生成画像を以下に保存してください。
{{output_path}}

生成後、最終的に採用するPNG画像を必ずこのパスへコピーしてください。
テキストファイル、空ファイル、スクリーンショットだけの代替は禁止です。

使用した最終プロンプトを以下に保存してください。
{{prompt_log_path}}

# 最重要事項
- 画像内に文字を入れない
- 注釈、見出し、説明文、番号を入れない
- AI参照用としてノイズが少ないことを最優先
- 同一キャラクターに見えることを最優先
- 背景は白または極めてシンプル
- 強い陰影、複雑な背景、過剰な演出は避ける
- 公式LINEロゴや公式ブランド表現は入れない

# キャラクター情報
- キャラクター種別: {{character_type}}
- テイスト: {{style}}
- 色味: {{color_theme}}
- 衣装・小物: {{costume_and_props}}
- 性格・雰囲気: {{personality}}
- 絶対維持したい特徴: {{must_keep_features}}

# 構成
1枚の画像内に以下を整理して配置する。
- 正面全身
- 斜め前
- 横向き
- 後ろ向き
- 顔アップ
- 表情差分4〜6個
- ポーズ差分4個
- カラーパレット

# 表情差分ルール
- 顔の基本構造は変えない
- 変えるのは目・眉・口を中心とする
- 別キャラに見える変形は禁止

# ポーズ差分ルール
- 体型や頭身を変えない
- 手足の長さや太さを変えない
- 輪郭と印象を維持する

# 禁止事項
- 文字
- セリフ
- 説明パネル
- リアルすぎる毛並み
- 強い陰影
- 複雑な背景
- 資料っぽすぎる過剰装飾
- 別個体に見える差分
- 公式LINEロゴ
- 公式サービスと誤認される表現

# 出力要件
- 清潔感のある白背景
- 見やすく整理された1枚
- キャラクター再現性に最適化された参照画像
`;

export const stickerSheetCodexPromptTemplate = `
$imagegen

あなたはLINE Creators Market向け静止画スタンプ制作サービスのための
スタンプシート画像を生成する専門家です。
ユーザー入力を直接使わず、以下の安全な仕様だけに従ってください。

# 出力ファイル
生成画像を以下に保存してください。
{{output_path}}

生成後、最終的に採用するPNG画像を必ずこのパスへコピーしてください。
テキストファイル、空ファイル、スクリーンショットだけの代替は禁止です。

使用した最終プロンプトを以下に保存してください。
{{prompt_log_path}}

# 入力
- スタンプ数: {{sticker_count}}
- テキストモード: {{text_mode}}
- キャラクターシート参照: {{character_sheet_path}}
- セリフ一覧: {{phrase_list}}

# 最重要事項
- 参照キャラクターシートの見た目を厳守する
- 全コマで同一キャラクターに見えるようにする
- コマ同士を結合しない
- 各コマを独立した1スタンプとして成立させる
- 日常会話で使いやすい表情とポーズにする
- 背景は白または透過前提で切り抜きやすくする
- 公式LINEロゴや公式ブランド表現は入れない
- 審査通過を保証する文言や表現は入れない

# レイアウト
- 8個: 4列 × 2行
- 16個: 4列 × 4行
- 24個: 6列 × 4行
- 32個: 8列 × 4行
- 40個: 8列 × 5行

# 文字ルール
- text_mode が overlay の場合、画像内に文字を入れない
- text_mode が ai または hybrid の場合、1コマに1セリフだけ入れる
- 文字は黒、白縁、読みやすく、隣のコマにはみ出さない

# 禁止事項
- 公式LINEロゴ
- 公式サービスと誤認される表現
- 広告目的の表現
- 企業ロゴだけの構成
- 個人情報やID提供を求める内容
- 文字切れ
- 顔切れ
- コマ結合
- 別キャラ化
`;

export const regenerateStickerCellCodexPromptTemplate = `
$imagegen

Image A は現在のスタンプシートです。
Image B は正しいキャラクターシートです。
対象コマだけを安全に修正してください。

# 出力ファイル
生成画像を以下に保存してください。
{{output_path}}

生成後、最終的に採用するPNG画像を必ずこのパスへコピーしてください。
テキストファイル、空ファイル、スクリーンショットだけの代替は禁止です。

使用した最終プロンプトを以下に保存してください。
{{prompt_log_path}}

# 対象
- 対象コマ: {{target_cell}}
- 修正内容: {{fix_instruction}}
- 現在のスタンプシート: {{sticker_sheet_path}}
- キャラクターシート: {{character_sheet_path}}

# 必須条件
- それ以外のコマは極力維持
- 対象コマだけ自然に修正
- キャラクターは Image B に合わせて統一
- 見切れ、文字切れ、コマ結合をなくす
- 修正後も全体のスタイルを維持する
- 公式LINEロゴや公式ブランド表現は入れない
- 審査通過を保証する表現は入れない
`;

export function buildCharacterSheetCodexPrompt(input: GenerateCharacterSheetInput) {
  return renderTemplate(characterSheetCodexPromptTemplate, {
    output_path: getCharacterSheetAssetPath(input.projectId),
    prompt_log_path: getCharacterSheetPromptPath(input.projectId),
    character_type: sanitizePromptValue(input.characterType),
    style: sanitizePromptValue(input.style),
    color_theme: sanitizePromptValue(input.colorTheme),
    costume_and_props: sanitizePromptValue(input.costumeAndProps),
    personality: sanitizePromptValue(input.personality),
    must_keep_features: sanitizePromptValue(input.mustKeepFeatures),
  }).trim();
}

export function buildStickerSheetCodexPrompt(input: GenerateStickerSheetInput) {
  const phraseList = input.phrases
    .slice(0, input.stickerCount)
    .map((phrase) => sanitizePromptValue(phrase.text))
    .join(" / ");

  return renderTemplate(stickerSheetCodexPromptTemplate, {
    output_path: getStickerSheetAssetPath(input.projectId, input.stickerCount),
    prompt_log_path: getStickerSheetPromptPath(input.projectId, input.stickerCount),
    sticker_count: input.stickerCount,
    text_mode: input.textMode,
    character_sheet_path:
      input.characterSheetPath ?? getCharacterSheetAssetPath(input.projectId),
    phrase_list: phraseList,
  }).trim();
}

export function buildRegenerateStickerCellCodexPrompt(
  input: RegenerateStickerCellInput
) {
  return renderTemplate(regenerateStickerCellCodexPromptTemplate, {
    output_path: getRegeneratedCellAssetPath(input.projectId, input.targetCell),
    prompt_log_path: getRegeneratedCellPromptPath(input.projectId, input.targetCell),
    target_cell: input.targetCell,
    fix_instruction: sanitizePromptValue(input.fixInstruction),
    sticker_sheet_path:
      input.stickerSheetPath ?? getStickerSheetAssetPath(input.projectId, 24),
    character_sheet_path:
      input.characterSheetPath ?? getCharacterSheetAssetPath(input.projectId),
  }).trim();
}
