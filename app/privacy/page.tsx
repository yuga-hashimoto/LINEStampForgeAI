import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "プライバシーポリシー | StampForge AI",
  description: "StampForge AIにおける個人情報、制作データ、AI生成用データの扱いについて。",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <InfoPage
        description="制作データとアカウント情報の扱いを、将来の本番運用を見据えて整理しています。"
        eyebrow="Privacy"
        title="プライバシーポリシー"
        sections={[
          {
            title: "取得する情報",
            items: [
              "ログインまたは問い合わせ時の氏名、メールアドレス",
              "スタジオ名、キャラクターシート名、セリフテンプレート",
              "画像生成やチェックに必要なキャラクター設定",
              "利用量、生成クレジット、書き出し履歴",
            ],
          },
          {
            title: "利用目的",
            body: [
              "取得した情報は、スタンプ制作UIの提供、キャラクターシート保存、問い合わせ対応、品質改善、生成ジョブ処理、利用量管理のために利用します。",
              "本番運用ではClerkによる外部Authとサーバー側セッションを利用します。Clerk未設定の開発環境では、ブラウザのlocalStorageを使うデモ認証にフォールバックします。",
            ],
          },
          {
            title: "外部AI APIとの接続方針",
            body: [
              "画像生成はCodex app-serverのimagegenをworker経由で利用する設計です。将来別プロバイダーへ接続する場合は、送信データの範囲、保存期間、利用規約を明示します。",
              "ユーザー入力をそのまま外部APIへ丸投げせず、サーバー側テンプレートに埋め込む設計を採用します。",
            ],
          },
          {
            title: "安全管理",
            body: [
              "制作データ、プロンプト、書き出しファイルは、アクセス権限とログ管理を前提に取り扱います。",
              "問い合わせへの対応や法令に基づく場合を除き、第三者へ個人情報を提供しません。",
            ],
          },
        ]}
      />
    </MarketingShell>
  );
}
