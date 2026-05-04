# LINE Stamp Forge AI

キャラクターシートを起点に、同じキャラクターで LINE Creators Market 向けの静止画スタンプセットを制作する SaaS フロントエンド MVP です。

実際の画像生成 API と決済は未接続です。認証はフロントエンドMVP用のローカルセッションで動作します。
MVP ではダミーデータで以下の制作パイプラインを UI として操作できます。

1. 企画入力
2. キャラクターシート生成
3. スタンプセット生成
4. 自動切り出し
5. Creators Market 向けチェック
6. PNG / ZIP 書き出し

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- React hooks
- sonner
- JSZip
- Codex app-server worker（初期MVPの画像生成バックエンド想定）

## セットアップ

```bash
npm install
```

## 起動方法

```bash
npm run dev
```

ブラウザで以下を開きます。

- LP: `http://localhost:3000/`
- ログイン: `http://localhost:3000/login`
- 無料登録: `http://localhost:3000/register`
- デモ: `http://localhost:3000/demo`
- アプリ内ホーム: `http://localhost:3000/app`
- 制作ダッシュボード: `http://localhost:3000/app/projects/demo`

画像生成ジョブを処理する worker は別プロセスで起動します。

```bash
npm run worker
```

キューを1件だけ処理したい場合は以下を使います。

```bash
npm run worker:once
```

## 実装ページ

- `/`
  - ランディングページ
  - ヒーロー、プロダクトプレビュー、ルールチップ、ベストプラクティス、料金タブ、フッター
- `/login`
  - ローカルセッションで動作するログインUI
- `/register`
  - 利用規約・プライバシーポリシー同意付きの無料登録UI
- `/demo`
  - 制作ダッシュボードへ入るためのプロダクトデモページ
- `/features`
  - 機能説明
- `/guide`
  - 使い方ガイド
- `/templates`
  - 公開テンプレート一覧
- `/best-practices`
  - 制作ベストプラクティス
- `/updates`
  - アップデート履歴
- `/help`
  - FAQとサポート導線
- `/contact`
  - バリデーションとtoast付き問い合わせフォーム
- `/terms`
  - 利用規約
- `/privacy`
  - プライバシーポリシー
- `/legal/commercial-transactions`
  - 特定商取引法に基づく表記
- `/company`
  - 運営会社情報
- `/app`
  - アプリ内ダッシュボード
- `/app/projects`
  - プロジェクト一覧、検索、ステータスフィルタ
- `/app/templates`
  - アプリ内テンプレート適用UI
- `/app/settings`
  - スタジオ設定、AI生成表記、法務リンク、利用量
- `/app/billing`
  - 単発売り・月額プランの利用量確認UI
- `/app/projects/demo`
  - 制作ダッシュボード
  - スタンプ数切り替え、文字モード切り替え、セリフテンプレート、Creators Market 自動チェック、AI生成コンテンツ注意、ダミーZIP書き出し

## 動作確認

```bash
npm run lint
npm run build
```

本番ビルドを起動して、主要導線をPlaywrightで確認します。

```bash
npm run start -- -p 3001
npm run qa
```

`npm run qa` では以下を確認します。

- LPと料金タブ
- 公開ページ、法務ページ、ヘルプ、問い合わせ
- 登録、ログイン、デモアカウント導線
- アプリ内ホーム、プロジェクト一覧、テンプレート、設定、プラン画面
- スタンプ数 8 / 16 / 24 / 32 / 40 の切り替え
- 文字モード切り替え
- Dialog / toast
- ダミーZIPダウンロード
- 画像生成ジョブAPI
- デスクトップと主要モバイル幅の横スクロールなし

## ダミーデータ

モックデータは `lib/mock-data.ts` に定義しています。

- `mockProject`
- `mockStickerPhrases`
- `mockCharacterSheet`
- `mockCheckResults`
- `mockOneShotPlans`
- `mockSubscriptionPlans`
- `mockAddOnOptions`
- `mockWorkflowSteps`

40個表示に対応するため、スタンプ用セリフは40件用意しています。

画像プレビュー用の生成済みアセットは `public/generated/projects/magic-rabbit-vol-1/` に保存しています。
同時に、生成時のプロンプトログは `.prompts/projects/magic-rabbit-vol-1/` に保存しています。

## 将来のAPI接続方針

`lib/api-stubs.ts` に画像生成・切り出し・チェック・書き出しの関数境界を用意しています。

- `generateCharacterSheet()`
- `generateStickerSheet()`
- `regenerateStickerCell()`
- `overlayStickerText()`
- `sliceStickerSheet()`
- `runCreatorsMarketChecks()`
- `exportZip()`

初期MVPでは Codex app-server + `$imagegen` を画像生成バックエンドとして扱います。UIからは同期的に画像生成せず、`/api/generation-jobs` でジョブを作成し、`apps/worker` がローカルJSONキューを処理する設計です。

- `packages/core/src/providers/image-generation-provider.ts`
  - `ImageGenerationProviderAdapter` の抽象インターフェース
- `packages/core/src/providers/codex-app-server-provider.ts`
  - 初期実装の `CodexAppServerImageProvider`
- `packages/core/src/providers/openrouter-image-provider.ts`
  - 将来差し替え用stub
- `packages/core/src/providers/openai-images-provider.ts`
  - 将来差し替え用stub
- `apps/worker/src/codex-app-server-client.ts`
  - stdio JSON-RPCで Codex app-server と通信するクライアント
- `packages/core/src/jobs/local-json-generation-job-store.ts`
  - DB導入前のローカルJSONジョブストア

現在のWebアプリはルート直下の Next.js App Router として配置しています。画像生成の共通ロジックと worker は `packages/core` / `apps/worker` に分離済みなので、将来 `apps/web` 構成へ移す場合も境界を保てます。

Codex app-server に渡すプロンプトでは、ユーザー入力をそのまま丸投げせず、サーバー側のテンプレートに安全に埋め込みます。Codex app-server 用テンプレートは `packages/core/src/prompts.ts`、従来の画像生成プロンプトテンプレートは `lib/prompts.ts` に保存しています。

OpenRouter または OpenAI Images API へ差し替える場合は、以下の環境変数名を想定しています。

- `OPENROUTER_API_KEY`
- `OPENROUTER_IMAGE_MODEL`
- `OPENROUTER_BASE_URL`

現時点では `.env` への依存はありません。

## 画像生成ジョブAPI

`POST /api/generation-jobs` で画像生成ジョブを作成します。

対応タイプ:

- `generate-character-sheet`
- `generate-sticker-sheet`
- `regenerate-sticker-cell`

ジョブステータス:

- `queued`
- `running`
- `succeeded`
- `failed`
- `canceled`

ジョブストアは初期MVPでは `.data/generation-jobs.json` を使います。このファイルは開発環境の実行状態なのでGit管理しません。

## 注意事項

- 本サービスは LINE 公式サービスではありません。
- LINE 公式ロゴは使用していません。
- 本サービスは審査通過を保証するものではありません。
- AI生成またはAI補助で作られたコンテンツは、販売時にAI生成コンテンツとして扱われる可能性があります。
- MVPのログインはブラウザの `localStorage` を使ったデモ用セッションです。正式運用ではサーバー側認証、決済、データ削除手段、監査ログを接続してください。
