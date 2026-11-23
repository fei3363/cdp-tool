// 週威脅情資報告產生器（Midnight Executive 主題）
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "2026/11 週威脅情資報告";

const C = { bg: "0D1B2A", panel: "1B263B", panel2: "415A77", accent: "E0A458", cyan: "4CC9F0", red: "EF476F", green: "06D6A0", text: "E0E1DD", mute: "9AA5B1" };
const F = "Microsoft JhengHei";
const REPORT_DATE = "2026-11-23";

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
  s.addText("Weekly Threat Intelligence Report｜2026 年 11 月 第 4 週", { x: 1.2, y: 3.1, w: 10, h: 0.5, fontFace: F, fontSize: 20, color: C.accent });
  s.addText("依情資金字塔：戰略 ‧ 戰術 ‧ 操作 ‧ 技術 四層呈現\n報告日期 " + REPORT_DATE + "（涵蓋 11/16–11/22 事件）", { x: 1.2, y: 3.8, w: 10, h: 0.8, fontFace: F, fontSize: 14, color: C.mute });
}


const RED = C.red, ACC = C.accent;
function table(s, rows, colW, rowH, y = 1.2, fs) {
  s.addTable(rows, { x: 0.5, y, w: 12.3, colW, border: { type: "solid", color: C.bg, pt: 1.5 }, rowH, valign: "middle" });
}
const mono = { fontFace: "Consolas", fontSize: 10 };

// ---------- 事件總覽 ----------
{
  const s = base("本週重大事件總覽", "EXECUTIVE SUMMARY", C.accent);
  const ev = [
    ["Armory Castle", "VMware vCenter 零時差", "中國駭客 UNC5221 自 9 月利用 CVE-2026-123890，偽造 SAML 繞過 MFA，續攻 ESXi 竊取 NTDS；初始入口為 BeyondTrust 零時差", RED],
    ["ARTEX", "AI 自主滲透框架遭濫用", "歐盟執委會 10/22 遭 ARTEX 攻擊，近一月仍有系統停擺；FBI 警告至少自 8 月遭濫用，最快 3 小時取得特權", RED],
    ["Wellington IT", "愛爾蘭第三方供應商遭駭", "約 40 家信用合作社收款人資料外洩；10/2–4 遭攻擊，11/16 才通知客戶", ACC],
    ["鳳凰旅遊", "臺灣旅行社個資外洩", "11/16 發現遭入侵，訂單個資外洩並出現冒名詐騙；繼易遊網之後再傳旅遊業事件", ACC],
    ["Docker Hub 金鑰", "公開映像檔金鑰秒被濫用", "石溪大學蜜罐：AWS 金鑰最快 7.86 秒遭使用，AI API 金鑰亦被盜用", C.cyan],
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
    ["邊界與管理平面設備淪為跳板", "Armory Castle 由遠端支援軟體入侵，再取得 vCenter 簽章金鑰；虛擬化管理層一旦失守，MFA 亦可被偽造 SAML 繞過。"],
    ["AI 自主攻擊工具平民化", "ARTEX 衍生超過 1.2 萬個儲存庫；Cloudflare 觀察 AI 滲透工具流量自 10/1 成長 30 倍，攻擊速度縮短至數小時。"],
    ["第三方供應商是最大連鎖風險", "Wellington IT 延遲 6 週才通報，波及全國四分之一信用合作社；供應商通報條款成為管理重點。"],
    ["憑證外洩的暴露窗口以秒計", "公開映像檔金鑰最快 7.86 秒遭用，刪除映像檔不足以止血，必須立即撤銷與輪替。"],
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
  const hi = { color: C.red, bold: true }, mid = { color: C.accent, bold: true };
  table(s, [
    [th("產業／資產"), th("風險等級"), th("風險說明"), th("管理層行動")],
    [td("虛擬化／私有雲"), td("高", hi), td("vCenter 零時差已遭國家級組織利用，可橫向控制 ESXi 並竊取 AD 資料庫"), td("盤點 vCenter 版本並升級；限縮管理網段；檢查 SSO 異常管理員")],
    [td("政府／金融／國防"), td("高", hi), td("AI 自主滲透工具大量流通，從鎖定到特權不到 3 小時"), td("縮短修補 SLA；強化暴露面管理與異常行為偵測")],
    [td("金融／會員制服務"), td("中高", mid), td("第三方供應商漏洞造成收款人資料外洩，後續恐衍生詐騙"), td("合約要求 72 小時內通報；提醒客戶防範釣魚")],
    [td("旅遊／電商（臺灣）"), td("中高", mid), td("訂單資料外洩後出現冒名客服詐騙，旅遊業接連受害"), td("強化訂單系統監控；建立防詐公告與客服驗證流程")],
    [td("DevOps／雲端"), td("中", mid), td("容器映像檔內嵌金鑰被自動化掃描器秒級擷取"), td("CI/CD 導入 secret scanning；使用短效憑證")],
  ], [2.4, 1.2, 4.3, 4.4], 0.8);
}

// ---------- 戰術情資 ----------
{
  const s = base("戰術情資：MITRE ATT&CK TTP 對應（1/2）", "戰術｜SOC 主管", C.green);
  table(s, [
    [th("事件"), th("攻擊步驟"), th("Technique ID"), th("名稱")],
    [td("Armory Castle"), td("利用 BeyondTrust 零時差入侵"), td("T1190"), td("Exploit Public-Facing Application")],
    [td("Armory Castle"), td("植入 SLIMSAVAGE／CAGEMATCH WebShell"), td("T1505.003"), td("Web Shell")],
    [td("Armory Castle"), td("gdb 對 /bin/env 設 SUID 提權"), td("T1548.001"), td("Setuid and Setgid")],
    [td("Armory Castle"), td("nmap 掃描 VMware 連接埠"), td("T1046"), td("Network Service Discovery")],
    [td("Armory Castle"), td("BONESAW 利用 CVE-2026-123890 並建立 SSO 管理員"), td("T1190／T1136"), td("Exploit App／Create Account")],
    [td("Armory Castle"), td("SAWSNAKE 偽造 SAML 令牌繞過 MFA"), td("T1606.002"), td("Forge Web Credentials: SAML Tokens")],
    [td("Armory Castle"), td("ESXi 新增 SSH 金鑰；BEARBONES 後門"), td("T1098.004／T1556"), td("SSH Authorized Keys／Modify Auth Process")],
    [td("Armory Castle"), td("從 VMFS 磁碟竊取 NTDS 並打包外傳"), td("T1003.003／T1560.001"), td("NTDS／Archive via Utility")],
    [td("Armory Castle"), td("LAZYBONES 以 Slack 為 C2（systemd 常駐）"), td("T1102.002／T1543.002"), td("Web Service／Systemd Service")],
  ], [1.7, 5.0, 2.4, 3.2], 0.55);
  s.addText("註：Technique 對應為依 GTIG 報告步驟之分析判斷，原報告未提供 ATT&CK 編號。", { x: 0.5, y: 6.7, w: 12, h: 0.3, fontFace: F, fontSize: 10, color: C.mute });
}
{
  const s = base("戰術情資：MITRE ATT&CK TTP 對應（2/2）", "戰術｜SOC 主管", C.green);
  table(s, [
    [th("事件"), th("攻擊步驟"), th("Technique ID"), th("名稱")],
    [td("ARTEX"), td("AI 代理自動掃描與偵察"), td("T1595／T1592"), td("Active Scanning／Gather Host Info")],
    [td("ARTEX"), td("自動利用漏洞與暴露 API"), td("T1190"), td("Exploit Public-Facing Application")],
    [td("ARTEX"), td("自動化權限提升與憑證取得"), td("T1068／T1078"), td("Priv. Escalation／Valid Accounts")],
    [td("ARTEX"), td("資料庫傾印與資料竊取"), td("T1005／T1041"), td("Data from Local System／Exfil over C2")],
    [td("Wellington IT"), td("利用網路銀行平臺漏洞（10/2–4）"), td("T1190"), td("Exploit Public-Facing Application")],
    [td("Wellington IT"), td("存取會員收款人資料"), td("T1213／T1530"), td("Data from Info Repositories／Cloud Storage")],
    [td("Wellington IT"), td("供應商入侵波及下游客戶"), td("T1199"), td("Trusted Relationship")],
    [td("鳳凰旅遊"), td("系統遭入侵，訂單資料遭存取（手法未公布）"), td("T1190（推測）"), td("Exploit Public-Facing Application")],
    [td("鳳凰旅遊"), td("冒名客服以訂單錯誤誘騙提供金融資訊"), td("T1566／T1598"), td("Phishing／Phishing for Information")],
    [td("Docker Hub"), td("掃描映像檔層擷取金鑰並濫用"), td("T1552.001／T1078.004"), td("Creds in Files／Cloud Accounts")],
  ], [1.7, 5.0, 2.4, 3.2], 0.55);
  s.addText("註：ARTEX 步驟依 FBI／iThome 描述之功能歸納；鳳凰旅遊攻擊手法尚未公布，標註為推測。", { x: 0.5, y: 6.75, w: 12, h: 0.3, fontFace: F, fontSize: 10, color: C.mute });
}

// ---------- 操作情資 ----------
{
  const s = base("操作情資：攻擊時間軸", "操作｜IR 團隊", C.red);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.7, w: 11.8, h: 0.06, fill: { color: C.panel2 } });
  const t = [
    ["9 月初", "Armory Castle 開始利用 vCenter 零時差", C.red],
    ["10/02–04", "Wellington IT 網銀平臺遭攻擊，10/6 修補", C.accent],
    ["10/22", "歐盟執委會偵測 ARTEX 攻擊", C.red],
    ["11/05–13", "CERT-EU、FBI、Cloudflare 接連警告 ARTEX", C.cyan],
    ["11/16", "鳳凰旅遊發現入侵；Wellington 通知客戶", C.accent],
    ["11/19", "博通修補 vCenter；EC 證實攻擊", C.green],
  ];
  t.forEach((e, i) => {
    const x = 0.8 + i * 2.1, up = i % 2 === 0;
    s.addShape(pres.shapes.OVAL, { x: x + 0.45, y: 3.55, w: 0.35, h: 0.35, fill: { color: e[2] } });
    s.addText(e[0], { x: x - 0.1, y: up ? 2.9 : 4.1, w: 1.5, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: e[2], align: "center" });
    s.addText(e[1], { x: x - 0.4, y: up ? 1.5 : 4.5, w: 2.1, h: 1.4, fontFace: F, fontSize: 11, color: C.text, align: "center", valign: up ? "bottom" : "top" });
  });
  s.addText("IR 提示：vCenter 漏洞自 9 月遭利用、11/19 才有修補，請回溯 9 月起 vCenter／ESXi 日誌。", { x: 0.5, y: 6.4, w: 12, h: 0.4, fontFace: F, fontSize: 12, color: C.accent });
}
{
  const s = base("操作情資：攻擊鏈拆解 — Armory Castle", "操作｜IR 團隊", C.red);
  const steps = [
    ["1 初始入侵", "BeyondTrust Remote Support 零時差 CVE-2026-102764"],
    ["2 落地提權", "內部 Linux 設備植入 WebShell，gdb 設 /bin/env SUID 取得 root"],
    ["3 攻擊 vCenter", "BONESAW 利用 CVE-2026-123890，竊取 data.mdb 與 SAML 簽章金鑰"],
    ["4 繞過 MFA", "SAWSNAKE 偽造 SAML 令牌，以管理員身分登入"],
    ["5 控制 ESXi", "以 vpxuser／root SSH 加入公鑰，vmfs_browser.py 讀取客體磁碟"],
    ["6 竊取與 C2", "NTDS 打包外傳；LAZYBONES 以 Slack 為 C2，每 50 分鐘重啟"],
  ];
  steps.forEach((e, i) => {
    const x = 0.5 + (i % 3) * 4.15, y = 1.4 + Math.floor(i / 3) * 2.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.8, h: 2.1, fill: { color: C.panel }, rectRadius: 0.1, line: { color: C.red, width: 1.5 } });
    s.addText(e[0], { x: x + 0.2, y: y + 0.15, w: 3.4, h: 0.6, fontFace: F, fontSize: 17, bold: true, color: C.red });
    s.addText(e[1], { x: x + 0.2, y: y + 0.8, w: 3.4, h: 1.2, fontFace: F, fontSize: 13, color: C.text, valign: "top" });
  });
  s.addText("應變建議：升級 vCenter；檢查未知 SSO 管理員、ESXi root authorized_keys、/tmp/123 等路徑；封鎖並查詢下頁 IP。", { x: 0.5, y: 6.3, w: 12.3, h: 0.6, fontFace: F, fontSize: 12, color: C.accent });
}
{
  const s = base("操作情資：攻擊鏈拆解 — ARTEX／Wellington IT", "操作｜IR 團隊", C.red);
  const chain = (y, title, arr, col) => {
    s.addText(title, { x: 0.5, y, w: 12, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: col });
    arr.forEach((a, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.55, w: 2.8, h: 1.5, fill: { color: C.panel }, line: { color: col, width: 1 } });
      s.addText(a, { x: x + 0.1, y: y + 0.55, w: 2.6, h: 1.5, fontFace: F, fontSize: 12, color: C.text, align: "center", valign: "middle" });
      if (i < arr.length - 1) s.addText("▶", { x: x + 2.8, y: y + 1.05, w: 0.3, h: 0.5, fontFace: F, fontSize: 14, color: col, align: "center" });
    });
  };
  chain(1.2, "ARTEX（AI 自動化攻擊）", ["串接外部 LLM（多為中國模型）", "AI 代理自動掃描、偵察、找漏洞", "自動利用並提權，數小時內取得特權", "竊取人資／醫療等內部系統資料"], C.cyan);
  chain(3.7, "Wellington IT（供應商供應鏈）", ["10/2–4 利用網銀平臺漏洞", "10/6 修補，但未即時通知客戶", "收款人姓名／IBAN／BIC 遭存取", "11/16 起通知，詐騙風險升高"], C.accent);
  s.addText("偵測重點：artex-* 命名的 Worker／高頻 API 探測、異常資料庫傾印請求；供應商事件通報與下游客戶警示流程。", { x: 0.5, y: 6.4, w: 12.3, h: 0.5, fontFace: F, fontSize: 12, color: C.accent });
}

// ---------- 技術情資 ----------
{
  const s = base("技術情資：IoC 彙整（網路指標）", "技術｜SOC 分析師", C.accent);
  const ips = ["103.147.251[.]5", "103.190.38[.]3", "118.174.128[.]34", "118.174.128[.]36", "118.174.128[.]38", "176.9.89[.]66", "185.71.15[.]109", "220.121.128[.]41", "222.108.77[.]44", "61.216.56[.]127", "81.45.89[.]43"];
  const rows = [[th("類型"), th("指標（已去敏 defang）"), th("說明"), th("來源")]];
  rows.push([td("IPv4"), td(ips.slice(0, 6).join("\n"), mono), td("Armory Castle 疑似混淆網路 IP（1/2）"), td("GTIG")]);
  rows.push([td("IPv4"), td(ips.slice(6).join("\n"), mono), td("Armory Castle 疑似混淆網路 IP（2/2）"), td("GTIG")]);
  rows.push([td("Domain／API"), td("slack[.]com/api/files.getUploadURLExternal\nslack[.]com/api/conversations.history"), td("LAZYBONES C2（合法服務，依行為偵測）"), td("GTIG")]);
  rows.push([td("Banner／Port"), td("SSH-2.0-pulsesecure_23345；TCP 53、33992"), td("BEARBONES 後門特徵"), td("GTIG")]);
  rows.push([td("Worker 命名"), td("artex-*、artex-pgrecon-*、artex-pgw-*、artex-do-*"), td("ARTEX 相關 Cloudflare Worker 命名模式"), td("Cloudflare")]);
  table(s, rows, [1.7, 4.8, 4.0, 1.8], [0.45, 1.3, 1.0, 0.8, 0.7, 0.7]);
  s.addText("已排除：ithome.com.tw、cloud.google.com、blog.cloudflare.com 等報告／新聞站；slack.com 僅列為被濫用服務端點。", { x: 0.5, y: 6.6, w: 12, h: 0.3, fontFace: F, fontSize: 10, color: C.mute });
}
{
  const s = base("技術情資：雜湊值、檔案與主機指標", "技術｜SOC 分析師", C.accent);
  table(s, [
    [th("類型"), th("指標"), th("說明")],
    [td("SHA-256／SHA-1／MD5"), td("GTIG 與 Cloudflare 報告均未公開雜湊（完整集合於 VirusTotal GTI Collection，需註冊）"), td("—")],
    [td("Ethereum 地址"), td("本週來源報告未提供"), td("—")],
    [td("Linux 路徑"), td("/tmp/123（BONESAW）；/tmp/sss（SAWSNAKE）；/tmp/dbr（BEARBONES）；/usr/bin/vmtoolscs（LAZYBONES）", mono), td("惡意程式落地位置")],
    [td("WebShell"), td("ActiveSer.jsp（SLIMSAVAGE，pwd=123）；u.jsp（CAGEMATCH）", mono), td("遠端執行與檔案上傳")],
    [td("暫存／資料"), td("/tmp/gdb_file；/tmp/rar；/tmp/123.rar；/tmp/123.key；/storage/db/vmware-vmdir/data.mdb；o.tar.gz；vmfs_browser.py", mono), td("提權、打包、外傳痕跡")],
    [td("API 端點"), td("/rest/appliance/access/ssh（VAMI 啟用 SSH）", mono), td("短暫開啟 SSH 後關閉")],
    [td("建置特徵"), td("Go 建置時間 2026-07-13T09:21:24Z；E:/CodeFiles/VulnScan/Vcenter/go_teamcheck/", mono), td("BONESAW 樣本中繼資料（可被竄改）")],
  ], [2.0, 7.0, 3.3], 0.65);
}
{
  const s = base("技術情資：CVE 與惡意軟體／工具名稱", "技術｜SOC 分析師", C.accent);
  table(s, [
    [th("CVE"), th("產品／影響"), th("狀態")],
    [td("CVE-2026-123890"), td("VMware vCenter 驗證繞過（SRP-6a 會話金鑰洩漏），BONESAW 利用"), td("11/19 修補；已遭在野利用（9 月起）")],
    [td("CVE-2026-102764"), td("BeyondTrust Remote Support 零時差，初始入侵途徑"), td("已於 BT26-05 修補；已遭利用")],
    [td("CVE-2026-59309"), td("vmdir LDAP 驗證繞過（7 月揭露，與本案不同）"), td("僅供比對")],
    [td("CVE-2025-22457"), td("Ivanti，先前活動曾見 LAZYBONES"), td("歷史關聯")],
  ], [2.4, 6.0, 3.9], 0.6);
  s.addText("惡意軟體／工具名稱", { x: 0.5, y: 4.4, w: 6, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.accent });
  const tags = ["BONESAW", "SAWSNAKE", "BEARBONES", "SLIMSAVAGE", "CAGEMATCH", "LAZYBONES", "ARTEX（含 ScopeWeaver、ARTEX PRO 衍生）", "Cairn／CyberStrikeAI"];
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
    ["立即（24h）", "升級 vCenter 修補 CVE-2026-123890；回溯 9 月起 SSO 管理員與 ESXi authorized_keys；封鎖 11 個 IP", C.red],
    ["本週", "盤點 BeyondTrust 版本；將 AI 滲透工具流量納入 WAF／偵測；檢視供應商通報條款與金鑰掃描", C.accent],
    ["持續", "容器映像檔導入 secret scanning；強化客戶防詐公告；追蹤 ARTEX 衍生版本與 FBI／CERT-EU 更新", C.cyan],
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
