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
- 選択されたテイスト詳細を最優先で守る
- 背景は白または極めてシンプル
- 強い陰影、複雑な背景、過剰な演出は避ける
- 公式LINEロゴや公式ブランド表現は入れない

# キャラクター情報
- キャラクター種別: {{character_type}}
- テイスト: {{style}}
- テイスト詳細: {{style_directive}}
- 色味: {{color_theme}}
- 衣装・小物: {{costume_and_props}}
- 性格・雰囲気: {{personality}}
- 絶対維持したい特徴: {{must_keep_features}}
- アップロード参照画像: {{reference_image}}

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
- 目標キャンバス: {{target_canvas}}
- 1コマの目標サイズ: 370×320px

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
- 指定スタンプ数に対応するグリッドを画像全体いっぱいに均等配置する
- 外周の余白、枠線、ガイド線、番号、見出しは入れない
- 各コマの内部には約10px以上の余白を残し、隣コマへ絵や文字をはみ出させない
- 各コマは独立した370×320px相当の比率で、切り出し後に単体スタンプとして成立させる

# 文字ルール
- text_mode が overlay の場合、画像内に文字を入れない
- text_mode が ai または hybrid の場合、1コマに1セリフだけ入れる
- セリフごとの文字色、形、スタイル指定を優先する
- 指定がない場合は黒、白縁、読みやすく、隣のコマにはみ出さない

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
  const referenceImages = input.referenceImages?.length
    ? input.referenceImages
        .slice(0, 3)
        .map((image, index) => `${index + 1}. ${image.name} (${image.url})`)
        .join("\n")
    : input.referenceImageUrl
      ? `${input.referenceImageName ?? "reference image"} (${input.referenceImageUrl})`
      : "なし";

  return renderTemplate(characterSheetCodexPromptTemplate, {
    output_path: getCharacterSheetAssetPath(input.projectId),
    prompt_log_path: getCharacterSheetPromptPath(input.projectId),
    character_type: sanitizePromptValue(input.characterType),
    style: sanitizePromptValue(input.style),
    style_directive: sanitizePromptValue(getCharacterStyleDirective(input.style)),
    color_theme: sanitizePromptValue(input.colorTheme),
    costume_and_props: sanitizePromptValue(input.costumeAndProps),
    personality: sanitizePromptValue(input.personality),
    must_keep_features: sanitizePromptValue(input.mustKeepFeatures),
    reference_image: sanitizePromptValue(referenceImages),
  }).trim();
}

export function buildStickerSheetCodexPrompt(input: GenerateStickerSheetInput) {
  const grid = stickerGridByCount[input.stickerCount];
  const phraseList = input.phrases
    .slice(0, input.stickerCount)
    .map((phrase, index) =>
      [
        `${index + 1}. セリフ: ${sanitizePromptValue(phrase.text)}`,
        `感情: ${sanitizePromptValue(phrase.emotion)}`,
        `キャラクターの動き: ${sanitizePromptValue(phrase.characterMotion ?? phrase.pose)}`,
        `文字色: ${sanitizePromptValue(phrase.textColor ?? "黒")}`,
        `文字の形: ${sanitizePromptValue(phrase.speechShape ?? "白縁文字")}`,
        `文字スタイル: ${sanitizePromptValue(phrase.speechStyle ?? "太字ポップ")}`,
        `補足: ${sanitizePromptValue(phrase.directionNote ?? phrase.pose)}`,
      ].join(" / ")
    )
    .join("\n");

  return renderTemplate(stickerSheetCodexPromptTemplate, {
    output_path: getStickerSheetAssetPath(input.projectId, input.stickerCount),
    prompt_log_path: getStickerSheetPromptPath(input.projectId, input.stickerCount),
    sticker_count: input.stickerCount,
    text_mode: input.textMode,
    target_canvas: `${grid.columns * 370}×${grid.rows * 320}px（${grid.columns}列×${grid.rows}行）`,
    character_sheet_path:
      input.characterSheetPath ?? getCharacterSheetAssetPath(input.projectId),
    phrase_list: phraseList,
  }).trim();
}

function getCharacterStyleDirective(style: string) {
  const artStyle = style.split("/")[0]?.trim();
  const lineWeight = style.match(/線の太さ:\s*([^/]+)/)?.[1]?.trim();

  const artStyleDirectives: Record<string, string> = {
    "LINEスタンプ向けポップ":
      "LINEスタンプ用途に合う、シンプルで読みやすいポップな2Dイラスト。大きい表情、太すぎない輪郭、フラット寄りの塗り。過剰な背景、写実、3Dレンダーは禁止。",
    "ゆるかわ":
      "ゆるくかわいい2Dキャラクター。丸い形、柔らかい表情、低めの情報量、親しみやすいデフォルメ。リアルな毛並み、強い陰影、硬いベクター感は禁止。",
    "手描き風":
      "手描き風を最優先。均一すぎない少し揺れた線、アナログペンで描いたような抜き、軽い塗りムラ、温かいラフさを残す。整いすぎたベクター線、3D、写真風、光沢の強いアニメ塗りは禁止。",
    "アニメ調":
      "明るいアニメ調の2Dキャラクター。整理された輪郭、はっきりした目と口、読みやすいフラット影。写実、3D、背景過多は禁止。",
    "水彩ライト":
      "淡い水彩ライト調。薄い色の重なり、やわらかい輪郭、白背景になじむ軽い質感。濃すぎる影、リアルな紙テクスチャ過多、写真風は禁止。",
    "シンプル線画":
      "シンプルな線画ベース。最小限の色、読みやすい輪郭、余白を活かしたキャラクター参照。複雑な装飾、塗り込みすぎ、背景過多は禁止。",
  };

  const lineWeightDirectives: Record<string, string> = {
    "細め": "線は細め。ただしスタンプ化しても消えない読みやすい太さを保つ。",
    "標準": "線は標準。小さく表示しても表情と輪郭が読み取れる太さにする。",
    "太め": "線は太め。輪郭と表情をはっきり見せるが、子供っぽくなりすぎない。",
  };

  return [
    artStyleDirectives[artStyle ?? ""] ?? "選択されたテイスト名を具体的な画風として反映する。",
    lineWeightDirectives[lineWeight ?? ""] ?? "指定された線の太さを一貫して守る。",
    "このテイストと線の太さが全ビュー、表情差分、ポーズ差分で変わらないようにする。",
  ].join(" ");
}

const stickerGridByCount = {
  8: { columns: 4, rows: 2 },
  16: { columns: 4, rows: 4 },
  24: { columns: 6, rows: 4 },
  32: { columns: 8, rows: 4 },
  40: { columns: 8, rows: 5 },
} as const;

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
