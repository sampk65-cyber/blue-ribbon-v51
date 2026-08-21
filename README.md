# 藍帶無花果・完全體 V5.1

工項管理整合版：功能3產能（內嵌）、功能5年度計畫（內嵌）、功能11上下班打卡。

## 本機預覽

用瀏覽器直接開啟 `index.html`（部分功能如定位需 HTTPS）。

## 部署到 Vercel（建議）

1. 將本專案推上 GitHub（見下方步驟）
2. 登入 [vercel.com](https://vercel.com) → Add New Project → Import 該 repo
3. Framework Preset 選 **Other**，輸出目錄留空
4. Deploy → 取得 `https://xxx.vercel.app`

## 部署到 GitHub Pages

1. Repo → Settings → Pages → Source: Deploy from branch `main` / root
2. 約 1 分鐘後開啟 `https://<帳號>.github.io/<repo>/`

## 使用提醒

- 正式請用 **HTTPS** 網址開啟（定位、部分 API 才穩定）
- 登入用工項帳號（例：A01 + 三碼）
- 功能3：帳號 A/B/C 開頭（或設計者／管理者）可進；進產能**不必再登一次**
- 產能歷史資料：第一次到「產能資料」按「匯入歷史資料」寫入 Firebase 即可，之後不必每次部署再傳
- 檔案較大（約 3MB），首次載入請稍候

## 版本

- V5.1：功能3／5 內嵌層統一「主畫面」動態島 +「回上一頁」
