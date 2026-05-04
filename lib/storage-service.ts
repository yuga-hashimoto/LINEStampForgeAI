export type AssetStorageRuntime = {
  driver: "local" | "r2";
  configured: boolean;
  uploadStrategy: string;
  publicBaseUrl?: string;
};

export function getAssetStorageRuntime(): AssetStorageRuntime {
  const driver = process.env.ASSET_STORAGE_DRIVER === "r2" ? "r2" : "local";

  if (driver === "r2") {
    const configured = Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_PUBLIC_BASE_URL
    );

    return {
      driver,
      configured,
      uploadStrategy: configured
        ? "Cloudflare R2互換ストレージへアップロード"
        : "R2環境変数が未設定のためローカル保存へフォールバック",
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    };
  }

  return {
    driver: "local",
    configured: true,
    uploadStrategy: "public/generated 配下のローカルファイルを配信",
  };
}
