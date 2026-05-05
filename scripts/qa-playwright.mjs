import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = "http://localhost:3001";
const screenshotDir = "output/playwright";

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1440, height: 920 },
});
const page = await context.newPage();
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

try {
  await assertRoute("/", "キャラクターシートから");
  await page
    .getByRole("heading", {
      name: /キャラクターシートから\s*LINEスタンプを/,
    })
    .waitFor();

  const lpAssets = await getGeneratedImageStatus(page);
  if (lpAssets.length < 2 || lpAssets.some((asset) => !asset.ok)) {
    throw new Error(`Generated LP assets did not load: ${JSON.stringify(lpAssets)}`);
  }

  await page.getByRole("tab", { name: "クリエイター月額" }).click();
  await page.getByText("Studio").waitFor();
  await page.getByRole("tab", { name: "単発売り" }).click();
  await page.getByText("24個標準").waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${screenshotDir}/lp-desktop.png`, fullPage: true });

  for (const route of [
    ["/features", "制作パイプラインを一気通貫で管理"],
    ["/guide", "6ステップでスタンプセットを作る"],
    ["/templates", "セリフテンプレート"],
    ["/best-practices", "レビュー前に品質を上げる"],
    ["/updates", "アップデート"],
    ["/terms", "利用規約"],
    ["/privacy", "プライバシーポリシー"],
    ["/help", "ヘルプセンター"],
    ["/company", "運営会社"],
    ["/legal/commercial-transactions", "特定商取引法に基づく表記"],
    ["/demo", "制作パイプラインを"],
  ]) {
    await assertRoute(route[0], route[1]);
  }

  await assertRoute("/contact", "お問い合わせ");
  await page.getByPlaceholder("山田 太郎").fill("山田 太郎");
  await page.getByPlaceholder("creator@example.com").fill("creator@example.com");
  await page
    .getByPlaceholder("プラン、商用レビュー、制作代行での利用などをご記入ください")
    .fill("法人レビューについて相談したいです。");
  await page.getByRole("button", { name: "送信する" }).click();
  await page.getByText("お問い合わせを受け付けました").waitFor();

  await assertRoute("/register", "無料で試す");
  await page.locator("input[type='checkbox']").click();
  await page.getByRole("button", { name: "アカウントを作成" }).click();
  await page.waitForURL(`${base}/app`);
  await page.getByRole("heading", { name: "ダッシュボード" }).waitFor();

  await assertRoute("/login", "ログイン");
  await page.getByRole("button", { name: "デモアカウントで続行" }).click();
  await page.waitForURL(`${base}/app/projects/demo`);
  await page.getByRole("heading", { name: "魔法うさぎスタンプ Vol.1" }).waitFor();

  await assertRoute("/app", "ダッシュボード");
  await assertRoute("/app/projects", "プロジェクト一覧");
  await assertRoute("/app/templates", "テンプレート");
  await page.getByRole("button", { name: "適用する" }).first().click();
  await page.getByText("デモプロジェクトへ適用しました").waitFor();
  await assertRoute("/app/settings", "スタジオ情報");
  await page.getByRole("button", { name: "保存する" }).click();
  await page.getByText("設定を保存しました").waitFor();
  await assertRoute("/app/billing", "現在の購入内容");
  await assertRoute(
    "/app/billing?checkout=demo&planId=standard-24",
    "デモCheckoutとして処理しました"
  );
  await page.getByLabel("ワークスペース内検索").fill("ZIP");
  await page.getByRole("button", { name: "ZIP書き出し 書き出し" }).click();
  await page.waitForURL(`${base}/app/projects/demo#export`);
  await page.getByRole("button", { name: "ZIPを書き出す" }).waitFor();

  await page.goto(`${base}/app/projects/demo`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "魔法うさぎスタンプ Vol.1" }).waitFor();
  await page.screenshot({
    path: `${screenshotDir}/dashboard-initial.png`,
    fullPage: true,
  });

  const stickerCountsChecked = [];
  for (const count of [8, 16, 24, 32, 40]) {
    await page.getByRole("radio", { name: String(count), exact: true }).click();
    await page.getByText(`スタンプシートプレビュー（${count}個）`).waitFor();
    await page.getByText(`自動切り出しプレビュー（${count}個）`).waitFor();
    stickerCountsChecked.push(count);
  }

  for (const label of ["AIに書かせる", "あと乗せ", "ハイブリッド"]) {
    await page.getByRole("radio", { name: label }).click();
  }

  await page.getByRole("button", { name: "特定コマを再生成" }).click();
  await page
    .getByRole("dialog")
    .getByPlaceholder("例: 12番の表情をもっと笑顔にする")
    .fill("12番をもっと笑顔にする");
  await page.getByRole("button", { name: "再生成する" }).click();
  await page.getByText("対象コマの再生成リクエストを受け付けました").waitFor();

  await page.getByRole("button", { name: "文字だけ修正" }).click();
  await page
    .getByRole("dialog")
    .getByPlaceholder("例: ありがとう を ありがとうございます に変更")
    .fill("ありがとうをありがとうございますに変更");
  await page.getByRole("button", { name: "修正する" }).click();
  await page.getByText("文字修正のダミー処理を開始しました").waitFor();

  await page.getByRole("button", { name: "余白を最適化" }).click();
  await page.getByText("余白を約10pxに最適化しました").waitFor();

  await page.getByRole("button", { name: "追加" }).click();
  await page
    .getByRole("dialog")
    .getByPlaceholder("例: 後で確認します")
    .fill("後で確認します");
  await page.getByRole("button", { name: "追加する" }).click();
  await page.getByText("セリフを追加しました").waitFor();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ZIPを書き出す" }).click();
  const download = await downloadPromise;
  const zipFilename = download.suggestedFilename();
  if (!zipFilename.endsWith(".zip")) {
    throw new Error(`ZIP download did not start: ${zipFilename}`);
  }
  await page.getByText("ダミーZIPを生成しました").waitFor();

  const submissionPackPromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/submission-packs") &&
      response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Creators Market 出品アシスタントを使う" }).click();
  const submissionPackResponse = await submissionPackPromise;
  const submissionPack = await submissionPackResponse.json();
  if (!submissionPack.manifestUrl || !submissionPack.token) {
    throw new Error(`Submission pack response failed: ${JSON.stringify(submissionPack)}`);
  }
  await page.getByText("申請パックURLを発行済み").waitFor();
  const submissionManifest = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return { status: response.status, json: await response.json() };
  }, submissionPack.manifestUrl);
  if (
    submissionManifest.status !== 200 ||
    submissionManifest.json.projectId !== "magic-rabbit-vol-1" ||
    submissionManifest.json.stickerType !== "static"
  ) {
    throw new Error(`Submission manifest failed: ${JSON.stringify(submissionManifest)}`);
  }
  const submissionZip = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      size: (await response.blob()).size,
    };
  }, submissionPack.zipUrl);
  if (
    submissionZip.status !== 200 ||
    !submissionZip.contentType?.includes("application/zip") ||
    submissionZip.size <= 0
  ) {
    throw new Error(`Submission ZIP failed: ${JSON.stringify(submissionZip)}`);
  }

  const dashboardAssets = await getGeneratedImageStatus(page);
  if (dashboardAssets.length < 3 || dashboardAssets.some((asset) => !asset.ok)) {
    throw new Error(
      `Generated dashboard assets did not load: ${JSON.stringify(dashboardAssets)}`
    );
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${screenshotDir}/dashboard-desktop.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 1280, height: 820 });
  for (const route of [
    "/",
    "/app/projects/demo",
    "/app/billing?checkout=demo&planId=standard-24",
  ]) {
    await assertRoute(route, route === "/" ? "キャラクターシートから" : undefined);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  for (const route of ["/", "/register", "/demo", "/app", "/app/projects/demo"]) {
    await assertRoute(route, route === "/" ? "キャラクターシートから" : undefined);
  }
  await page.screenshot({ path: `${screenshotDir}/mobile-last.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 920 });
  const apiResult = await page.evaluate(async () => {
    const response = await fetch("/api/generation-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "qa-project",
        type: "generate-character-sheet",
        input: {
          projectId: "qa-project",
          characterType: "白うさぎ",
          style: "かわいいマジシャン風",
          colorTheme: "白、黒、オレンジ、ピンク",
          costumeAndProps: "シルクハット、マント、星のステッキ",
          personality: "明るく丁寧",
          mustKeepFeatures: "白い耳、黒い帽子、オレンジの花飾り",
        },
      }),
    });
    return { status: response.status, json: await response.json() };
  });

  if (apiResult.status !== 201 || apiResult.json.job?.status !== "queued") {
    throw new Error(`Generation job API failed: ${JSON.stringify(apiResult)}`);
  }

  const apiList = await page.evaluate(async () => {
    const response = await fetch("/api/generation-jobs?projectId=qa-project");
    return await response.json();
  });

  if (!Array.isArray(apiList.jobs) || apiList.jobs.length < 1) {
    throw new Error(`Generation job list failed: ${JSON.stringify(apiList)}`);
  }

  const usageResult = await page.evaluate(async () => {
    const response = await fetch("/api/usage", { cache: "no-store" });
    return { status: response.status, json: await response.json() };
  });

  if (
    usageResult.status !== 200 ||
    !usageResult.json.usage ||
    usageResult.json.environment?.authProvider !== "開発デモ"
  ) {
    throw new Error(`Usage API failed: ${JSON.stringify(usageResult)}`);
  }

  const checkoutResult = await page.evaluate(async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: "standard-24" }),
    });
    return { status: response.status, json: await response.json() };
  });

  if (
    checkoutResult.status !== 200 ||
    checkoutResult.json.mode !== "demo" ||
    !checkoutResult.json.url?.includes("/app/billing?checkout=demo&planId=standard-24")
  ) {
    throw new Error(`Checkout API demo fallback failed: ${JSON.stringify(checkoutResult)}`);
  }

  if (errors.length > 0) {
    throw new Error(`Console/page errors: ${JSON.stringify(errors)}`);
  }

  console.log(
    JSON.stringify(
      {
        routesChecked: 24,
        lpGeneratedAssets: lpAssets.length,
        dashboardGeneratedAssets: dashboardAssets.length,
        stickerCountsChecked,
        zipFilename,
        submissionPackToken: submissionPack.token,
        apiJobId: apiResult.json.job.id,
        usageProvider: usageResult.json.environment.authProvider,
        checkoutMode: checkoutResult.json.mode,
        consoleErrors: errors,
      },
      null,
      2
    )
  );
} finally {
  await context.close();
  await browser.close();
}

async function assertRoute(path, expectedText) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  if (expectedText) {
    await page.getByText(expectedText).first().waitFor();
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  if (overflow) {
    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      path: window.location.pathname,
    }));
    throw new Error(`Horizontal overflow: ${JSON.stringify(metrics)}`);
  }
}

async function getGeneratedImageStatus(page) {
  return page.evaluate(() =>
    Array.from(document.images)
      .map((img) => ({
        src: img.getAttribute("src") || "",
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        ok: img.complete && img.naturalWidth > 0,
      }))
      .filter((img) => img.src.includes("/generated/"))
  );
}
