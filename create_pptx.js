// 週威脅情資報告產生器（Midnight Executive 主題）
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "2026/11 週威脅情資報告";

const C = { bg: "0D1B2A", panel: "1B263B", panel2: "415A77", accent: "E0A458", cyan: "4CC9F0", red: "EF476F", green: "06D6A0", text: "E0E1DD", mute: "9AA5B1" };
const F = "Microsoft JhengHei";
const REPORT_DATE = "2026-11-16";

function base(title, tier, tierColor) {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: tierColor || C.accent } });
  s.addText(title, { x: 0.5, y: 0.3, w: 10.3, h: 0.7, fontFace: F, fontSize: 26, bold: true, color: C.text });
  if (tier) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.9, y: 0.4, w: 2.2, h: 0.45, fill: { color: tierColor }, rectRadius: 0.1 });
  if (tier) s.addText(tier, { x: 10.9, y: 0.4, w: 2.2, h: 0.45, fontFace: F, fontSize: 12, bold: true, color: C.bg, align: "center", valign: "middle" });
  s.addText(`威脅情資週報 ${REPORT_DATE}｜來源：iThome 及原廠研究報告`, { x: 0.5, y: 7.05, w: 9, h: 0.3, fontFace: F, fontSize: 9, color: C.mute });
  return s;
}
const th = (t) => ({ text: t, options: { bold: true, color: C.bg, fill: { color: C.accent }, fontFace: F, fontSize: 11 } });
const td = (t, o = {}) => ({ text: t, options: Object.assign({ color: C.text, fill: { color: C.panel }, fontFace: F, fontSize: 10 }, o) });

// ---------- 封面 ----------
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.OVAL, { x: 9.8, y: -1.5, w: 5, h: 5, fill: { color: C.panel } });
  s.addShape(pres.shapes.OVAL, { x: 11, y: 4.8, w: 3.5, h: 3.5, fill: { color: C.panel2, transparency: 50 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 0.12, h: 2.2, fill: { color: C.accent } });
  s.addText("週威脅情資報告", { x: 1.2, y: 2.1, w: 9, h: 1, fontFace: F, fontSize: 44, bold: true, color: C.text });
  s.addText("Weekly Threat Intelligence Report｜2026 年 11 月 第 3 週", { x: 1.2, y: 3.1, w: 10, h: 0.5, fontFace: F, fontSize: 20, color: C.accent });
  s.addText("依情資金字塔：戰略 ‧ 戰術 ‧ 操作 ‧ 技術 四層呈現\n報告日期 " + REPORT_DATE + "（涵蓋 11/09–11/15 事件）", { x: 1.2, y: 3.8, w: 10, h: 0.8, fontFace: F, fontSize: 14, color: C.mute });
}

// ---------- 事件總覽 ----------
{
  const s = base("本週重大事件總覽", "EXECUTIVE SUMMARY", C.accent);
  const ev = [
    ["wfx-loot", "GitHub Actions 憑證竊取", "4,837 個遭入侵帳號探測 61,764 個儲存庫，至少 1,835 個已執行惡意程式", C.red],
    ["SignDrop", "Windows CLFS 零時差", "PoC 公開，一般權限可提權至 SYSTEM；Cyderes 已重現", C.red],
    ["UNC6783", "宣稱入侵資安院 102GB", "資安院稱去年 7 月已通報；文件屬 TLP:GREEN 月報，真偽待確認", C.accent],
    ["CVE-2026-119618", "Apache mod_http2 RCE", "CVSS 9.8；2.4.55–2.4.70；Wiz 估 64% 雲端環境曝險；2.4.71 已修補", C.red],
    ["Red Hat Quay", "兩項重大漏洞", "CVE-2026-123710（9.8）、CVE-2026-110697（9.9）；金鑰植入與跨租戶權杖外洩", C.accent],
  ];
  ev.forEach((e, i) => {
    const y = 1.3 + i * 1.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 12.3, h: 0.95, fill: { color: C.panel }, rectRadius: 0.08 });
    s.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.3, w: 0.35, h: 0.35, fill: { color: e[3] } });
    s.addText(e[0], { x: 1.2, y: y + 0.08, w: 3.3, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: C.text });
    s.addText(e[1], { x: 1.2, y: y + 0.5, w: 3.3, h: 0.35, fontFace: F, fontSize: 11, color: C.accent });
    s.addText(e[2], { x: 4.6, y, w: 8.1, h: 0.95, fontFace: F, fontSize: 12, color: C.text, valign: "middle" });
  });
}

// ---------- 戰略情資 ----------
{
  const s = base("戰略情資：威脅趨勢", "戰略｜CISO／管理層", C.cyan);
  const cards = [
    ["軟體供應鏈與 CI/CD 成主戰場", "wfx-loot 以被盜權杖改寫 Actions 工作流程，竊取雲端與 AI API 金鑰並清除紀錄；憑證即入口。"],
    ["基礎元件重大漏洞密集揭露", "Apache HTTP/2、Red Hat Quay 皆為 CVSS 9.8 以上；容器映像庫遭竄改將波及部署鏈。"],
    ["零時差公開 PoC 縮短修補窗口", "Nightmare-Eclipse 七個月釋出 16 個 Windows 零時差，提權類漏洞成為後滲透標配。"],
    ["情資外洩宣稱與聲譽風險", "UNC6783 聲稱取得資安院資料；即使真偽未明，仍影響信任並可能洩漏防禦態勢。"],
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + (i % 2) * 6.25, y = 1.3 + Math.floor(i / 2) * 2.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 6.0, h: 2.5, fill: { color: C.panel }, rectRadius: 0.1 });
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.25, w: 0.08, h: 0.8, fill: { color: C.cyan } });
    s.addText(c[0], { x: x + 0.3, y: y + 0.2, w: 5.5, h: 0.7, fontFace: F, fontSize: 17, bold: true, color: C.cyan });
    s.addText(c[1], { x: x + 0.3, y: y + 0.95, w: 5.5, h: 1.4, fontFace: F, fontSize: 13, color: C.text, valign: "top" });
  });
}
{
  const s = base("戰略情資：產業風險與管理建議", "戰略｜CISO／管理層", C.cyan);
  const rows = [
    [th("產業／資產"), th("風險等級"), th("風險說明"), th("管理層行動")],
    [td("軟體開發／SaaS"), td("高", { color: C.red, bold: true }), td("CI/CD 機密、雲端與 AI 金鑰遭大規模竊取，且事後難以鑑識"), td("強制 GitHub 權杖最小權限與短效憑證；納入第三方稽核")],
    [td("雲端／網站營運"), td("高", { color: C.red, bold: true }), td("Apache 2.4.55–2.4.70 啟用 HTTP/2 者可遭未驗證 RCE"), td("限期升級 2.4.71；無法升級先停用 h2/h2c")],
    [td("容器／DevOps 平臺"), td("高", { color: C.red, bold: true }), td("Quay 簽章金鑰植入不會到期，重設密碼亦無法撤銷"), td("盤點 Quay 版本、清查未授權簽章金鑰並輪替權杖")],
    [td("企業端點（Windows）"), td("中高", { color: C.accent, bold: true }), td("SignDrop 無官方修補，PoC 已公開"), td("強化 EDR 偵測提權行為，追蹤微軟修補公告")],
    [td("政府／關鍵基礎設施"), td("中", { color: C.accent, bold: true }), td("聯防月報外洩宣稱，暴露 IoC 與防禦重點"), td("確認情資分享管道與 TLP 管控；強化 BPO／客服社交工程防護")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.3, w: 12.3, colW: [2.4, 1.2, 4.3, 4.4], border: { type: "solid", color: C.bg, pt: 2 }, rowH: 0.8, valign: "middle" });
}

// ---------- 戰術情資 ----------
{
  const s = base("戰術情資：MITRE ATT&CK TTP 對應（1/2）", "戰術｜SOC 主管", C.green);
  const rows = [
    [th("事件"), th("攻擊步驟"), th("Technique ID"), th("名稱")],
    [td("wfx-loot"), td("使用遭竊 GitHub 權杖登入帳號"), td("T1078"), td("Valid Accounts")],
    [td("wfx-loot"), td("PR 探測寫入權限、改寫 Workflow／postinstall"), td("T1195.002"), td("Compromise Software Supply Chain")],
    [td("wfx-loot"), td("惡意 Shell 腳本於 CI Runner 執行"), td("T1059.004"), td("Unix Shell")],
    [td("wfx-loot"), td("蒐集 secrets、讀取 Runner.Worker 記憶體"), td("T1552.001／T1003.007"), td("Credentials In Files／Proc Filesystem")],
    [td("wfx-loot"), td("建立 AWS 長效金鑰、修改 IAM 信任政策、新增 Azure 聯合憑證"), td("T1098.001／T1098.003"), td("Additional Cloud Credentials／Roles")],
    [td("wfx-loot"), td("回復修改並刪除 workflow run 與日誌"), td("T1070"), td("Indicator Removal")],
    [td("wfx-loot"), td("HTTP POST 與 Telegram 外傳"), td("T1041／T1567"), td("Exfil Over C2／Web Service")],
    [td("SignDrop"), td("誘導 Defender 以 SYSTEM 存取，重導路徑令 CLFS 建檔"), td("T1068"), td("Exploitation for Priv. Escalation")],
    [td("SignDrop"), td("改寫檔案內容配合 DLL 載入"), td("T1574.001"), td("Hijack Execution Flow: DLL")],
    [td("SignDrop"), td("呼叫原生 API／清除檔案"), td("T1106／T1070.004"), td("Native API／File Deletion")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.2, w: 12.3, colW: [1.5, 5.2, 2.4, 3.2], border: { type: "solid", color: C.bg, pt: 1.5 }, rowH: 0.52, valign: "middle" });
}
{
  const s = base("戰術情資：MITRE ATT&CK TTP 對應（2/2）", "戰術｜SOC 主管", C.green);
  const rows = [
    [th("事件"), th("攻擊步驟"), th("Technique ID"), th("名稱")],
    [td("UNC6783"), td("即時通訊社交工程，偽造 Okta 登入頁"), td("T1566.003"), td("Spearphishing via Service")],
    [td("UNC6783"), td("竊取剪貼簿內容以繞過 MFA"), td("T1115／T1111"), td("Clipboard Data／MFA Interception")],
    [td("UNC6783"), td("註冊攻擊者裝置維持存取"), td("T1098.005"), td("Device Registration")],
    [td("UNC6783"), td("偽造資安更新投放遠端存取程式"), td("T1219／T1204"), td("Remote Access Software／User Execution")],
    [td("UNC6783"), td("資料外流後以 Proton Mail 勒索"), td("T1657"), td("Financial Theft")],
    [td("Apache"), td("對 mod_http2 發送競爭條件請求，堆積損毀"), td("T1190"), td("Exploit Public-Facing Application")],
    [td("Apache"), td("取得 Web 伺服器程序控制權（潛在）"), td("T1059"), td("Command and Scripting Interpreter")],
    [td("Quay"), td("濫用金鑰輪替端點植入永久簽章金鑰"), td("T1190／T1098"), td("Exploit Public App／Account Manipulation")],
    [td("Quay"), td("竊取跨租戶機器人驗證權杖"), td("T1528"), td("Steal Application Access Token")],
    [td("Quay"), td("覆寫私人映像檔、刪除或改名機器人帳號"), td("T1525／T1531"), td("Implant Internal Image／Account Access Removal")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.2, w: 12.3, colW: [1.5, 5.2, 2.4, 3.2], border: { type: "solid", color: C.bg, pt: 1.5 }, rowH: 0.52, valign: "middle" });
  s.addText("註：Apache 與 Quay 尚無在野利用報告，對應為潛在攻擊路徑；其餘依報導與廠商報告。", { x: 0.5, y: 6.75, w: 12, h: 0.3, fontFace: F, fontSize: 10, color: C.mute });
}

// ---------- 操作情資 ----------
{
  const s = base("操作情資：攻擊時間軸", "操作｜IR 團隊", C.red);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.7, w: 11.8, h: 0.06, fill: { color: C.panel2 } });
  const t = [
    ["11/06", "高雄警方公布 AI 自動化攻擊案", C.mute],
    ["11/10", "wfx-loot 開始；SignDrop PoC 公開", C.red],
    ["11/11", "Apache 2.4.71 發布修補 CVE-2026-119618", C.green],
    ["11/12", "Aikido 揭露 wfx-loot；攻擊改用 Telegram 外傳", C.accent],
    ["11/13", "UNC6783 宣稱入侵資安院；Quay 公告", C.accent],
    ["11/14", "iThome 報導 SignDrop、Quay、Wiz 估 64% 曝險", C.cyan],
  ];
  t.forEach((e, i) => {
    const x = 0.8 + i * 2.1, up = i % 2 === 0;
    s.addShape(pres.shapes.OVAL, { x: x + 0.45, y: 3.55, w: 0.35, h: 0.35, fill: { color: e[2] } });
    s.addText(e[0], { x: x - 0.1, y: up ? 2.9 : 4.1, w: 1.5, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: e[2], align: "center" });
    s.addText(e[1], { x: x - 0.4, y: up ? 1.5 : 4.5, w: 2.1, h: 1.4, fontFace: F, fontSize: 11, color: C.text, align: "center", valign: up ? "bottom" : "top" });
  });
  s.addText("IR 提示：wfx-loot 事後會自動還原程式碼，需比對 workflow run 編號是否缺號。", { x: 0.5, y: 6.4, w: 12, h: 0.4, fontFace: F, fontSize: 12, color: C.accent });
}
{
  const s = base("操作情資：攻擊鏈拆解 — wfx-loot", "操作｜IR 團隊", C.red);
  const steps = [
    ["1 取得存取", "使用 4,837 個遭入侵帳號的 GitHub 權杖"],
    ["2 探測", "開 PR 至 wfx-docs 分支，確認寫入權限"],
    ["3 植入", "注入 workflow／.ci-xxxxxx.sh／postinstall"],
    ["4 竊取", "蒐集 secrets、雲端與 AI 金鑰、讀取記憶體"],
    ["5 持久化", "建立 AWS 金鑰、IAM 信任、Azure 聯合憑證"],
    ["6 清除", "1 分鐘內還原提交並刪除 run 日誌"],
  ];
  steps.forEach((e, i) => {
    const x = 0.5 + (i % 3) * 4.15, y = 1.4 + Math.floor(i / 3) * 2.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.8, h: 2.1, fill: { color: C.panel }, rectRadius: 0.1, line: { color: C.red, width: 1.5 } });
    s.addText(e[0], { x: x + 0.2, y: y + 0.15, w: 3.4, h: 0.6, fontFace: F, fontSize: 17, bold: true, color: C.red });
    s.addText(e[1], { x: x + 0.2, y: y + 0.8, w: 3.4, h: 1.2, fontFace: F, fontSize: 13, color: C.text, valign: "top" });
  });
  s.addText("應變建議：檢查 11/10 起異常 PR 與 workflow 變更；輪替 GitHub／雲端／AI 金鑰；稽核 AWS IAM 與 Azure 聯合憑證。", { x: 0.5, y: 6.3, w: 12.3, h: 0.6, fontFace: F, fontSize: 12, color: C.accent });
}
{
  const s = base("操作情資：攻擊鏈拆解 — SignDrop／UNC6783", "操作｜IR 團隊", C.red);
  const chain = (y, title, arr, col) => {
    s.addText(title, { x: 0.5, y, w: 12, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: col });
    arr.forEach((a, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.55, w: 2.8, h: 1.5, fill: { color: C.panel }, line: { color: col, width: 1 } });
      s.addText(a, { x: x + 0.1, y: y + 0.55, w: 2.6, h: 1.5, fontFace: F, fontSize: 12, color: C.text, align: "center", valign: "middle" });
      if (i < arr.length - 1) s.addText("▶", { x: x + 2.8, y: y + 1.05, w: 0.3, h: 0.5, fontFace: F, fontSize: 14, color: col, align: "center" });
    });
  };
  chain(1.2, "SignDrop（本機提權）", ["已有一般使用者程式碼執行", "誘導 Defender 以 SYSTEM 存取準備好的檔案", "路徑重新導向，CLFS 建立驗證檔繼承權限", "改寫內容＋DLL 載入取得 SYSTEM"], C.cyan);
  chain(3.7, "UNC6783（社交工程與勒索）", ["IM 誘騙員工進入偽 Okta 頁", "竊取剪貼簿繞過 MFA 並註冊裝置", "偽造資安更新植入遠端存取工具", "竊取資料後以 Proton Mail 勒索"], C.accent);
  s.addText("偵測重點：Defender 異常檔案存取、CLFS 日誌驗證檔建立、Okta 新裝置註冊、員工剪貼簿相關腳本。", { x: 0.5, y: 6.4, w: 12.3, h: 0.5, fontFace: F, fontSize: 12, color: C.accent });
}

// ---------- 技術情資 ----------
{
  const s = base("技術情資：IoC 彙整（網路指標）", "技術｜SOC 分析師", C.accent);
  const rows = [
    [th("類型"), th("指標（已去敏 defang）"), th("說明"), th("來源")],
    [td("IPv4:Port"), td("194.150.166[.]244:8080/exfil"), td("wfx-loot 外傳伺服器（54 份樣本）"), td("Aikido／StepSecurity")],
    [td("IPv4:Port"), td("18.143.168[.]96:8080/exfil"), td("wfx-loot 外傳伺服器（3 份樣本）"), td("Aikido／StepSecurity")],
    [td("IPv4:Port"), td("153.75.82[.]159:8080/exfil"), td("11/12 第三台外傳伺服器"), td("StepSecurity")],
    [td("Domain"), td("api.telegram.org（sendDocument）"), td("Telegram 備援外傳；chat -1004340163187（合法服務，需依行為偵測）"), td("StepSecurity")],
    [td("Domain"), td("git.projectnightcrawler[.]dev"), td("Nightmare-Eclipse 自架 Git 鏡像"), td("Cyderes")],
    [td("Domain"), td("git.churchofmalware[.]org"), td("Nightmare-Eclipse 自架 Git 鏡像"), td("Cyderes")],
    [td("URL"), td("github[.]com/MSNightmare/SignDrop"), td("SignDrop PoC 儲存庫"), td("Cyderes／iThome")],
    [td("Callback token"), td("b42d70a7aab9140ca19e8249；15f44heehnax8jdf41yx"), td("上傳參數 t=，可用於日誌比對"), td("StepSecurity")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.2, w: 12.3, colW: [1.6, 4.4, 4.2, 2.1], border: { type: "solid", color: C.bg, pt: 1.5 }, rowH: 0.58, valign: "middle" });
  s.addText("已排除：aikido.dev、stepsecurity.io、cyderes.com、github.com 等報告／新聞站與 127.0.0.1。", { x: 0.5, y: 6.6, w: 12, h: 0.3, fontFace: F, fontSize: 10, color: C.mute });
}
{
  const s = base("技術情資：雜湊值、檔案與主機指標", "技術｜SOC 分析師", C.accent);
  const rows = [
    [th("類型"), th("指標"), th("說明")],
    [td("SHA-256"), td("89695abb392d5cfd4972672961e644bb46baa98aa1ed7173c2a2816c762735cf", { fontFace: "Consolas", fontSize: 9 }), td("wfx-loot Stealer 腳本（Aikido）")],
    [td("Git blob SHA-1"), td("ee6e5addfe591923fc385553cb66cf0d25634a6b", { fontFace: "Consolas", fontSize: 9 }), td("docs/wfx-audit.md（非檔案雜湊，為 git blob）")],
    [td("MD5 / ETH 地址"), td("本週來源報告未提供"), td("—")],
    [td("分支"), td("wfx-docs；chore/[a-z0-9]{8}；ci-check-[0-9]{4}"), td("攻擊者建立的分支命名模式")],
    [td("檔案"), td(".ci-[a-z0-9]{6}.sh；.github/workflows/build-audit-*.yml"), td("植入的腳本與工作流程")],
    [td("PR／提交"), td("docs: dependency audit notes；ci: refresh build cache；ci: restore；chore: add ci helper"), td("可於提交紀錄搜尋")],
    [td("受影響套件"), td("Packagist digitalelvis/neuronai-studio 3.14.3；Go onuragtas/docker-env v1.0.278、v1.0.280"), td("Aikido 列出的受影響版本")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.2, w: 12.3, colW: [2.0, 6.6, 3.7], border: { type: "solid", color: C.bg, pt: 1.5 }, rowH: 0.65, valign: "middle" });
}
{
  const s = base("技術情資：CVE 與惡意軟體／工具名稱", "技術｜SOC 分析師", C.accent);
  const rows = [
    [th("CVE"), th("產品／影響"), th("CVSS"), th("狀態")],
    [td("CVE-2026-119618"), td("Apache HTTP Server 2.4.55–2.4.70 mod_http2，未驗證 RCE"), td("9.8"), td("2.4.71 已修補；無公開 exploit、無在野利用")],
    [td("CVE-2026-123710"), td("Red Hat Quay 服務金鑰輪替驗證缺陷"), td("9.8"), td("已發布更新（3.9–3.18）；未證實遭利用")],
    [td("CVE-2026-110697"), td("Red Hat Quay 跨租戶機器人權杖外洩"), td("9.9"), td("Quay.io 已修補；未證實遭利用")],
    [td("（SignDrop）"), td("Windows CLFS 零時差，尚無 CVE 編號"), td("—"), td("PoC 已公開，待微軟修補")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.2, w: 12.3, colW: [2.4, 5.2, 0.9, 3.8], border: { type: "solid", color: C.bg, pt: 1.5 }, rowH: 0.6, valign: "middle" });
  s.addText("惡意軟體／工具名稱", { x: 0.5, y: 4.4, w: 6, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.accent });
  const tags = ["wfx-loot（wfx Phantom）", "SignDrop", "Raccoon（UNC6783 疑似關聯）", "ARTEX", "BossAI", "Cairn", "AntiFox"];
  tags.forEach((g, i) => {
    const x = 0.5 + (i % 4) * 3.1, y = 4.95 + Math.floor(i / 4) * 0.8;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.9, h: 0.6, fill: { color: C.panel2 }, rectRadius: 0.15 });
    s.addText(g, { x, y, w: 2.9, h: 0.6, fontFace: F, fontSize: 11, color: C.text, align: "center", valign: "middle" });
  });
}

// ---------- 結語 ----------
{
  const s = base("優先行動清單", "ACTION ITEMS", C.accent);
  const items = [
    ["立即（24h）", "輪替 GitHub／雲端／AI 金鑰；封鎖三個外傳 IP；查核 11/10 起 workflow 異動與缺號 run", C.red],
    ["本週", "升級 Apache 2.4.71（或停用 h2/h2c）；Quay 更新並清查簽章金鑰；Okta 新裝置註冊稽核", C.accent],
    ["持續", "追蹤微軟 SignDrop 修補；導入 EDR 提權偵測；強化 BPO／客服社交工程訓練", C.cyan],
  ];
  items.forEach((e, i) => {
    const y = 1.5 + i * 1.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 12.3, h: 1.4, fill: { color: C.panel }, rectRadius: 0.1 });
    s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.35, w: 0.7, h: 0.7, fill: { color: e[2] } });
    s.addText(String(i + 1), { x: 0.8, y: y + 0.35, w: 0.7, h: 0.7, fontFace: F, fontSize: 20, bold: true, color: C.bg, align: "center", valign: "middle" });
    s.addText(e[0], { x: 1.8, y: y + 0.1, w: 3, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: e[2] });
    s.addText(e[1], { x: 1.8, y: y + 0.6, w: 10.7, h: 0.7, fontFace: F, fontSize: 13, color: C.text });
  });
}

pres.writeFile({ fileName: "threat_intel_report_202611.pptx" }).then((f) => console.log("written", f));
