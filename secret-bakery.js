// ============================================================
// 私密烘焙工坊 - Roche 插件
// 原版 Sweet Bite v9.0 内衣特典，适配 Roche API
// ============================================================

(function() {
  window.RochePlugin.register({
    id: "secret-bakery",
    name: "私密烘焙工坊",
    version: "1.0.0",
    apps: [
      {
        id: "secret-bakery-home",
        name: "烘焙工坊",
        icon: "cake",
        iconImage: "",
        async mount(container, roche) {
          // ---------- 创建 MIBU 兼容层 ----------
          const MIBU = {
            getContacts: async function() {
              const chars = await roche.character.list();
              return chars.map(c => ({
                id: c.id,
                name: c.handle || c.name || '未命名',
                avatar: c.avatar || `https://picsum.photos/seed/${c.id}/100/100`,
                persona: c.persona || c.bio || ''
              }));
            },
            getContact: async function(id) {
              const c = await roche.character.get(id);
              return {
                id: c.id,
                name: c.handle || c.name || '未知',
                avatar: c.avatar || `https://picsum.photos/seed/${c.id}/100/100`,
                persona: c.persona || c.bio || '',
                myName: 'CHERRY'
              };
            },
            showToast: function(msg) { roche.ui.toast(msg); },
            saveData: async function(key, data) { await roche.storage.set(key, data); },
            loadData: async function(key) { return await roche.storage.get(key); },
            callAIStream: async function(messages, callback) {
              // 使用 roche.ai.chat 一次性获取，然后模拟流式输出
              try {
                const result = await roche.ai.chat({
                  messages: messages,
                  temperature: 0.7
                });
                const fullText = result.text || '';
                let index = 0;
                const chunkSize = 5;
                const interval = setInterval(() => {
                  if (index < fullText.length) {
                    const chunk = fullText.substring(index, index + chunkSize);
                    index += chunkSize;
                    callback(chunk, fullText.substring(0, index));
                  } else {
                    clearInterval(interval);
                  }
                }, 30);
                // 确保回调最终完成（无需额外处理）
              } catch (e) {
                // 若 AI 调用失败，将错误信息传给回调
                callback('', '[AI 错误] ' + e.message);
                throw e;
              }
            }
          };

          // ---------- 渲染 HTML 模板 ----------
          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
/* ==== 基础主题系统 ==== */
[data-theme="mint"] { --bg:#f0fdf4; --panel:#ffffff; --primary:#10b981; --primary-light:#d1fae5; --text-main:#064e3b; --text-sub:#34d399; --shadow:rgba(16,185,129,0.15); }
[data-theme="berry"] { --bg:#fff1f2; --panel:#ffffff; --primary:#f43f5e; --primary-light:#ffe4e6; --text-main:#881337; --text-sub:#fb7185; --shadow:rgba(244,63,94,0.15); }
[data-theme="choco"] { --bg:#fefae0; --panel:#ffffff; --primary:#d97706; --primary-light:#fef3c7; --text-main:#78350f; --text-sub:#fbbf24; --shadow:rgba(217,119,6,0.15); }
[data-theme="taro"] { --bg:#faf5ff; --panel:#ffffff; --primary:#a855f7; --primary-light:#f3e8ff; --text-main:#581c87; --text-sub:#c084fc; --shadow:rgba(168,85,247,0.15); }
[data-theme="night"] { --bg:#111827; --panel:#1f2937; --primary:#6366f1; --primary-light:#3730a3; --text-main:#f3f4f6; --text-sub:#818cf8; --shadow:rgba(99,102,241,0.2); }

* { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-tap-highlight-color:transparent; outline:none; }
body { background-color:var(--bg); color:var(--text-main); height:100vh; display:flex; flex-direction:column; overflow:hidden; transition:background-color 0.6s ease, color 0.6s ease; position:relative; }

#nsfw-deco { position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; opacity:0; transition:opacity 0.8s ease, background 0.8s ease; }

.page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; z-index:10; }
.page.active { display:flex; animation:slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes slideUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0; transform:scale(0.95)} to{opacity:1; transform:scale(1)} }

/* ==== 头部 ==== */
.header { padding:15px 20px; display:flex; justify-content:space-between; align-items:center; z-index:30; background:rgba(255,255,255,0.15); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.3); box-shadow:0 2px 10px rgba(0,0,0,0.02); }
.header-title { font-weight:900; font-size:20px; color:var(--text-main); letter-spacing:1px; text-shadow:0 1px 2px rgba(255,255,255,0.5); }
.header-title span { color:var(--primary); }
.theme-btn { font-size:16px; cursor:pointer; background:var(--panel); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px var(--shadow); transition:transform 0.2s; border:1px solid var(--primary-light); }
.theme-btn:active { transform:scale(0.85); }

/* ==== 主题选择器 ==== */
.theme-picker { position:absolute; top:65px; right:20px; background:var(--panel); border-radius:24px; padding:16px; display:none; grid-template-columns:repeat(3, 1fr); gap:12px; box-shadow:0 15px 40px rgba(0,0,0,0.2); z-index:50; border:2px solid var(--primary-light); transform-origin:top right; }
.theme-picker.show { display:grid; animation:fadeIn 0.2s ease-out; }
.theme-dot { width:36px; height:36px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); transition:transform 0.2s; }
.theme-dot:active { transform:scale(0.8); }
.theme-gacha { grid-column:1/-1; background:linear-gradient(45deg, #ff9a9e, #fecfef); color:#fff; border:none; padding:12px; border-radius:16px; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(255,154,158,0.4); transition:0.2s; text-shadow:0 1px 2px rgba(0,0,0,0.1); }
.theme-nsfw { grid-column:1/-1; background:linear-gradient(135deg, #111, #881337); color:#fff; border:1px solid #f43f5e; padding:12px; border-radius:16px; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(136,19,55,0.5); text-shadow:0 0 5px #f43f5e; transition:0.2s; }
.theme-nsfw:active, .theme-gacha:active { transform:scale(0.95); }

/* ==== 选人 ==== */
.char-list { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }
.char-card { background:var(--panel); border-radius:20px; padding:15px; display:flex; align-items:center; gap:15px; cursor:pointer; box-shadow:0 6px 20px var(--shadow); border:2px solid transparent; transition:transform 0.2s, border-color 0.2s; }
.char-card:active { transform:scale(0.96); border-color:var(--primary); }
.char-av { width:60px; height:60px; border-radius:18px; background-size:cover; background-position:center; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
.char-name { font-weight:900; font-size:17px; }

/* ==== 导航 ==== */
.main-view { flex:1; position:relative; overflow:hidden; z-index:5; }
.tab-page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; overflow-y:auto; scroll-behavior:smooth; padding-bottom:0; }
.tab-page.active { display:flex; }
.bottom-nav { display:flex; background:rgba(255,255,255,0.9); backdrop-filter:blur(20px); padding:10px 15px 20px; z-index:20; flex-shrink:0; border-radius:30px 30px 0 0; box-shadow:0 -5px 30px rgba(0,0,0,0.05); justify-content:space-around; border-top:1px solid rgba(255,255,255,0.6); }
.nav-item { display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--text-sub); cursor:pointer; width:60px; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.nav-item.active { color:var(--primary); transform:translateY(-4px); }
.nav-icon { font-size:22px; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; transition:0.3s; background:transparent; }
.nav-item.active .nav-icon { background:var(--primary-light); box-shadow:0 4px 12px var(--shadow); }
.nav-text { font-size:11px; font-weight:900; }

/* ==== 顶部操作条 ==== */
.top-bar { padding:12px 20px 0; display:flex; justify-content:center; position:sticky; top:0; z-index:15; background:linear-gradient(to bottom, var(--bg) 85%, transparent); }
.refresh-btn { background:linear-gradient(135deg, var(--primary), var(--primary-light)); color:#fff; border:none; padding:10px 24px; border-radius:20px; font-size:13px; font-weight:900; cursor:pointer; box-shadow:0 6px 15px var(--shadow); transition:0.2s; text-shadow:0 1px 2px rgba(0,0,0,0.1); letter-spacing:1px; }
.refresh-btn:active { transform:scale(0.95); }

/* ==== 通用选项区 ==== */
.lab-container, .closet-container { padding:0 20px 130px; }
.sec-title { font-size:13px; font-weight:900; margin:20px 0 10px; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.6); padding:6px 12px; border-radius:12px; backdrop-filter:blur(8px); color:var(--primary); box-shadow:0 2px 8px rgba(0,0,0,0.03); }
.sec-title::before { content:''; display:block; width:5px; height:14px; background:var(--primary); border-radius:3px; }
.pill-group { display:flex; flex-wrap:wrap; gap:8px; }
.pill, .c-pill { background:var(--panel); border:1px solid var(--primary-light); color:var(--text-sub); padding:8px 14px; border-radius:18px; font-size:12px; font-weight:800; cursor:pointer; transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow:0 2px 6px rgba(0,0,0,0.02); }
.pill.active, .c-pill.active { background:var(--primary); color:#fff; border-color:var(--primary); box-shadow:0 6px 15px var(--shadow); transform:translateY(-2px); }
.pill.weird { border-color:#f87171; color:#f87171; background:rgba(254,242,242,0.8); }
.pill.weird.active { background:#f87171; border-color:#f87171; color:#fff; }
.pill.potion { border-color:#d946ef; color:#d946ef; background:rgba(253,244,255,0.8); }
.pill.potion.active { background:#d946ef; border-color:#d946ef; color:#fff; box-shadow:0 6px 15px rgba(217,70,239,0.3); }

.make-btn-wrap { position:fixed; bottom:90px; left:0; width:100%; display:flex; justify-content:center; z-index:15; pointer-events:none; }
.make-btn { background:linear-gradient(135deg, var(--text-main), var(--primary)); color:#fff; border:none; padding:15px 55px; border-radius:30px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 10px 25px rgba(0,0,0,0.3); pointer-events:auto; letter-spacing:2px; transition:0.2s; }
.make-btn:active { transform:scale(0.95) translateY(2px); box-shadow:0 6px 15px rgba(0,0,0,0.2); }

/* ==== 聊天区与固定高度精美悬浮状态栏 ==== */
#tab-chat { overflow: hidden; padding-bottom: 0; }
.chat-page-wrapper { display:flex; flex-direction:column; height:100%; width:100%; }

.status-glass-card { background:rgba(255,255,255,0.65); backdrop-filter:blur(25px); border-radius:20px; margin:12px 15px 5px; padding:12px 15px; box-shadow:0 8px 25px var(--shadow); border:1px solid rgba(255,255,255,0.9); flex-shrink:0; position:relative; height:110px; overflow-y:auto; overflow-x:hidden; }
.status-glass-card::-webkit-scrollbar { width:0; height:0; display:none; }
.status-glass-card::after { content:''; position:absolute; bottom:-20px; right:-10px; width:80px; height:80px; background:var(--primary-light); border-radius:50%; opacity:0.4; z-index:0; pointer-events:none; }
.st-row { position:relative; z-index:1; display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; }
.st-row:last-child { margin-bottom:0; padding-top:8px; border-top:1px dashed rgba(0,0,0,0.08); }
.st-avatar { padding:3px 8px; border-radius:8px; font-weight:900; font-size:11px; color:#fff; flex-shrink:0; box-shadow:0 3px 8px rgba(0,0,0,0.1); letter-spacing:0.5px; display:flex; align-items:center; justify-content:center; }
.st-avatar.his-av { background:var(--primary); }
.st-avatar.my-av { background:linear-gradient(135deg, #f43f5e, #fb7185); }
.st-info { flex:1; display:flex; flex-wrap:wrap; gap:4px; align-content:flex-start; padding-top:1px; min-height:22px; }
.st-pill { font-size:10px; font-weight:800; padding:3px 7px; background:rgba(255,255,255,0.8); border:1px solid var(--primary-light); border-radius:8px; color:var(--text-main); box-shadow:0 2px 5px rgba(0,0,0,0.02); }
.st-pill.nsfw { color:#f43f5e; border-color:rgba(244,63,94,0.3); background:rgba(244,63,94,0.08); }
.st-pill.toy { color:#a855f7; border-color:rgba(168,85,247,0.3); background:rgba(168,85,247,0.08); }

.chat-history { flex:1; overflow-y:auto; padding:10px 15px 15px; display:flex; flex-direction:column; gap:16px; scroll-behavior:smooth; }
.msg-wrap { display:flex; flex-direction:column; max-width:88%; }
.msg-wrap.user { align-self:flex-end; align-items:flex-end; }
.msg-wrap.ai { align-self:flex-start; align-items:flex-start; }
.msg-bubble { padding:12px 16px; border-radius:20px; font-size:14px; line-height:1.6; word-wrap:break-word; box-shadow:0 4px 15px rgba(0,0,0,0.05); position:relative; }
.user .msg-bubble { background:var(--text-main); color:#fff; border-bottom-right-radius:4px; font-weight:500; }
.ai .msg-bubble { background:var(--panel); border:1px solid var(--primary-light); border-bottom-left-radius:4px; color:var(--text-main); }
.thought-box { margin-bottom:8px; font-size:12px; color:var(--primary); font-weight:800; background:var(--bg); padding:10px 14px; border-radius:14px; border:1px solid var(--primary-light); border-left:4px solid var(--primary); }
.thought-box::before { content:'💭'; margin-right:6px; }
.action-text { color:var(--text-sub); font-style:italic; font-size:13px; margin-bottom:6px; display:block; }

.chat-input-bar { background:rgba(255,255,255,0.95); backdrop-filter:blur(15px); padding:6px 10px; display:flex; gap:10px; align-items:center; margin:0 15px 10px; border-radius:25px; box-shadow:0 6px 20px var(--shadow); border:1px solid rgba(255,255,255,0.8); flex-shrink:0; }
.play-btn { background:linear-gradient(135deg, #f43f5e, #fb7185); color:#fff; border:none; width:38px; height:38px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(244,63,94,0.3); flex-shrink:0; transition:0.2s; }
.play-btn:active { transform:scale(0.9); }
.chat-input { flex:1; background:transparent; border:none; font-size:14px; outline:none; color:var(--text-main); font-weight:500; padding:0 6px; }
.chat-input::placeholder { color:var(--text-sub); opacity:0.8; }
.chat-send { background:var(--primary); color:#fff; border:none; width:38px; height:38px; border-radius:50%; font-size:16px; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:0.2s; box-shadow:0 4px 10px var(--shadow); }
.chat-send:active { transform:scale(0.9); }

.closet-card { background:var(--panel); border-radius:24px; padding:20px; box-shadow:0 8px 25px var(--shadow); border:1px solid var(--primary-light); position:relative; overflow:hidden; margin-bottom:20px; }
.closet-card::before { content:''; position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:var(--bg); border-radius:50%; z-index:0; opacity:0.6; }
.closet-title { text-align:center; font-weight:900; color:var(--primary); font-size:16px; margin-bottom:15px; position:relative; z-index:2; border-bottom:2px dashed var(--primary-light); padding-bottom:10px; letter-spacing:1px; }

.menu-grid { padding:15px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.menu-card { background:var(--panel); border-radius:20px; padding:15px; text-align:center; box-shadow:0 8px 20px var(--shadow); border:1px solid var(--primary-light); display:flex; flex-direction:column; align-items:center; }
.m-icon { font-size:45px; margin-bottom:10px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
.m-name { font-weight:900; font-size:14px; color:var(--text-main); margin-bottom:12px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.m-re-btn { background:var(--primary-light); color:var(--primary); border:none; padding:10px 12px; border-radius:14px; font-size:12px; font-weight:900; cursor:pointer; width:100%; transition:0.2s; }
.m-re-btn:active { background:var(--primary); color:#fff; }

.overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:100; display:none; align-items:center; justify-content:center; }
.overlay.show { display:flex; animation:fadeIn 0.2s; }
.shaker { font-size:80px; animation:shake 0.4s infinite; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.3)); }
@keyframes shake { 0%,100%{transform:rotate(0deg) translateY(0)} 25%{transform:rotate(-15deg) translateY(-5px)} 75%{transform:rotate(15deg) translateY(-5px)} }

.result-card { background:var(--panel); width:85%; max-width:320px; border-radius:30px; padding:30px 25px; text-align:center; position:relative; border:2px solid var(--primary-light); box-shadow:0 25px 50px rgba(0,0,0,0.3); }
.d-name-input { width:100%; border:none; border-bottom:3px dashed var(--primary); text-align:center; font-size:22px; font-weight:900; color:var(--text-main); padding:8px; outline:none; margin-bottom:20px; background:transparent; transition:0.3s; }
.d-name-input:focus { border-bottom-style:solid; background:var(--primary-light); border-radius:12px 12px 0 0; }
.d-recipe { font-size:12px; color:var(--text-sub); line-height:1.6; background:var(--bg); padding:15px; border-radius:16px; margin-bottom:20px; text-align:left; border:1px solid rgba(0,0,0,0.05); font-weight:700; }
.d-serve-btn { width:100%; background:var(--primary); color:#fff; border:none; padding:15px; border-radius:20px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 8px 25px var(--shadow); transition:0.2s; letter-spacing:1px; }
.d-serve-btn:active { transform:scale(0.96); }

.play-panel { background:var(--panel); width:90%; max-width:360px; border-radius:25px; padding:20px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; border:2px solid var(--primary-light); box-shadow:0 20px 50px rgba(0,0,0,0.3); }
.play-title { text-align:center; font-size:16px; font-weight:900; color:var(--primary); margin-bottom:10px; }
.play-btn-item { background:var(--bg); border:1px solid var(--primary-light); padding:12px 15px; border-radius:16px; font-size:13px; font-weight:800; color:var(--text-main); text-align:left; cursor:pointer; transition:0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.02); }
.play-btn-item:active { background:var(--primary-light); transform:scale(0.97); }

.play-gacha { background:linear-gradient(135deg, #a855f7, #c084fc); color:#fff; border:none; padding:15px; border-radius:18px; font-size:14px; font-weight:900; text-align:center; cursor:pointer; margin-top:5px; box-shadow:0 6px 20px rgba(168,85,247,0.3); transition:0.2s; }
.play-gacha-nsfw { background:linear-gradient(135deg, #881337, #f43f5e); color:#fff; border:none; padding:15px; border-radius:18px; font-size:14px; font-weight:900; text-align:center; cursor:pointer; margin-top:5px; box-shadow:0 6px 20px rgba(244,63,94,0.4); transition:0.2s; text-shadow:0 1px 3px rgba(0,0,0,0.3); }
.play-gacha:active, .play-gacha-nsfw:active { transform:scale(0.97); }

.sys-text { text-align:center; font-size:12px; color:var(--text-sub); margin:10px 0; font-weight:800; }
.loading-blink { animation:blink 1.5s infinite; opacity:0.6; }
@keyframes blink { 50%{opacity:0.2} }
</style>
</head>
<body data-theme="berry">

<div id="nsfw-deco"></div>

<div class="page active" id="page-select">
  <div class="header">
    <div class="header-title">Sweet <span>Bite.</span></div>
    <div class="theme-btn" onclick="window._SB_togglePicker(event, 'tp1')">🎨</div>
  </div>
  <div class="theme-picker" id="tp1">
    <div class="theme-dot" style="background:#10b981" onclick="window._SB_setTheme('mint')"></div>
    <div class="theme-dot" style="background:#f43f5e" onclick="window._SB_setTheme('berry')"></div>
    <div class="theme-dot" style="background:#d97706" onclick="window._SB_setTheme('choco')"></div>
    <div class="theme-dot" style="background:#a855f7" onclick="window._SB_setTheme('taro')"></div>
    <div class="theme-dot" style="background:#6366f1" onclick="window._SB_setTheme('night')"></div>
    <button class="theme-gacha" onclick="window._SB_randomTheme()">🎲 绝美盲盒主题</button>
    <button class="theme-nsfw" onclick="window._SB_randomNsfwTheme()">😈 色情盲盒主题</button>
  </div>
  <div class="sys-text" style="text-align:left; padding:0 24px;">想和谁在厨房度过甜蜜时光？</div>
  <div class="char-list" id="charList">加载中...</div>
</div>

<div class="page" id="page-main">
  <div class="header">
    <div class="header-title" id="roomTitle">私密烘焙坊</div>
    <div class="theme-btn" onclick="window._SB_togglePicker(event, 'tp2')">🎨</div>
  </div>
  <div class="theme-picker" id="tp2">
    <div class="theme-dot" style="background:#10b981" onclick="window._SB_setTheme('mint')"></div>
    <div class="theme-dot" style="background:#f43f5e" onclick="window._SB_setTheme('berry')"></div>
    <div class="theme-dot" style="background:#d97706" onclick="window._SB_setTheme('choco')"></div>
    <div class="theme-dot" style="background:#a855f7" onclick="window._SB_setTheme('taro')"></div>
    <div class="theme-dot" style="background:#6366f1" onclick="window._SB_setTheme('night')"></div>
    <button class="theme-gacha" onclick="window._SB_randomTheme()">🎲 绝美盲盒主题</button>
    <button class="theme-nsfw" onclick="window._SB_randomNsfwTheme()">😈 色情盲盒主题</button>
  </div>
  
  <div class="main-view">
    <div class="tab-page active" id="tab-bake">
      <div class="top-bar"><button class="refresh-btn" onclick="window._SB_refreshCake()">✨ 换一批烘焙灵感</button></div>
      <div class="lab-container">
        <div class="sec-title">🍰 蛋糕胚 (单选)</div><div class="pill-group" id="opt-base"></div>
        <div class="sec-title">🪄 蛋糕形状 (单选)</div><div class="pill-group" id="opt-shape"></div>
        <div class="sec-title">🍦 抹面奶油 (单选)</div><div class="pill-group" id="opt-frosting"></div>
        <div class="sec-title">🍯 表层流心瀑布 (单选)</div><div class="pill-group" id="opt-drip"></div>
        <div class="sec-title">🍓 内层夹心 (单选)</div><div class="pill-group" id="opt-filling"></div>
        <div class="sec-title">🍇 鲜切水果 (单选)</div><div class="pill-group" id="opt-fruit"></div>
        <div class="sec-title">✨ 顶部装饰 (最多3选)</div><div class="pill-group" id="opt-topping"></div>
        <div class="sec-title" style="color:#d946ef">🧪 隐性加料 (单选)</div><div class="pill-group" id="opt-potion"></div>
        <div class="sec-title">🍽️ 装盘容器 (单选)</div><div class="pill-group" id="opt-plate"></div>
        <div class="sec-title">🍴 品尝餐具 (单选)</div><div class="pill-group" id="opt-fork"></div>
      </div>
      <div class="make-btn-wrap"><button class="make-btn" onclick="window._SB_makeCake()">🪄 烘焙出炉</button></div>
    </div>

    <div class="tab-page" id="tab-chat">
      <div class="chat-page-wrapper">
        <div class="status-glass-card">
          <div class="st-row">
            <div class="st-avatar his-av" id="st-his-name">他</div>
            <div class="st-info" id="st-his-detail"></div>
          </div>
          <div class="st-row">
            <div class="st-avatar my-av">CHERRY</div>
            <div class="st-info" id="st-my-detail"></div>
          </div>
        </div>
        
        <div class="chat-history" id="chatBox">
          <div class="sys-text">门锁已反锁。空气中弥漫着香甜与暧昧的气息。</div>
        </div>
        
        <div class="chat-input-bar">
          <button class="play-btn" onclick="window._SB_openPlayPanel()">🍰</button>
          <input type="text" class="chat-input" id="chatInput" placeholder="输入你的行动或话语...">
          <button class="chat-send" onclick="window._SB_sendChat()">➤</button>
        </div>
      </div>
    </div>

    <div class="tab-page" id="tab-closet">
      <div class="top-bar"><button class="refresh-btn" onclick="window._SB_refreshCloset()">✨ 一键刷新衣橱盲盒</button></div>
      <div class="closet-container" style="margin-top:15px;">
        <div class="closet-card">
          <div class="closet-title">👔 为他搭配装扮</div>
          <div class="sec-title">服饰</div><div class="pill-group" id="c-his-clothes"></div>
          <div class="sec-title">发型</div><div class="pill-group" id="c-his-hair"></div>
          <div class="sec-title">首饰</div><div class="pill-group" id="c-his-jewelry"></div>
          <div class="sec-title">配件</div><div class="pill-group" id="c-his-special"></div>
          <div class="sec-title" style="color:#f43f5e">色情饰品</div><div class="pill-group" id="c-his-nsfw"></div>
          <div class="sec-title" style="color:#a855f7">情趣玩具</div><div class="pill-group" id="c-his-toys"></div>
        </div>
        <div class="closet-card">
          <div class="closet-title">👗 我的私密装扮</div>
          <div class="sec-title">服饰</div><div class="pill-group" id="c-my-clothes"></div>
          <div class="sec-title" style="color:#f43f5e">👙 情趣内衣 (新!)</div><div class="pill-group" id="c-my-lingerie"></div>
          <div class="sec-title">发型</div><div class="pill-group" id="c-my-hair"></div>
          <div class="sec-title">首饰</div><div class="pill-group" id="c-my-jewelry"></div>
          <div class="sec-title">配件</div><div class="pill-group" id="c-my-special"></div>
          <div class="sec-title" style="color:#f43f5e">色情饰品</div><div class="pill-group" id="c-my-nsfw"></div>
          <div class="sec-title" style="color:#a855f7">情趣玩具</div><div class="pill-group" id="c-my-toys"></div>
        </div>
      </div>
    </div>

    <div class="tab-page" id="tab-menu">
      <div class="sys-text" style="margin-top:20px;">你们的专属甜品图鉴</div>
      <div class="menu-grid" id="menuGrid"></div>
    </div>
  </div>

  <div class="bottom-nav">
    <div class="nav-item active" onclick="window._SB_switchTab('bake', this)"><div class="nav-icon">🎂</div><div class="nav-text">做蛋糕</div></div>
    <div class="nav-item" onclick="window._SB_switchTab('chat', this)"><div class="nav-icon">💬</div><div class="nav-text">互动</div></div>
    <div class="nav-item" onclick="window._SB_switchTab('closet', this)"><div class="nav-icon">👗</div><div class="nav-text">衣橱</div></div>
    <div class="nav-item" onclick="window._SB_switchTab('menu', this)"><div class="nav-icon">📖</div><div class="nav-text">图鉴</div></div>
  </div>
</div>

<div class="overlay" id="bakeAnim"><div style="text-align:center"><div class="shaker">🧑‍🍳</div><div style="color:#fff;font-weight:900;font-size:18px;margin-top:15px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">正在精心烘烤中...</div></div></div>
<div class="overlay" id="resultModal">
  <div class="result-card">
    <div style="font-size:65px;margin-bottom:15px;filter:drop-shadow(0 5px 15px rgba(0,0,0,0.2))">🎂</div>
    <input type="text" class="d-name-input" id="cakeName" value="私房手作蛋糕">
    <div class="d-recipe" id="cakeRecipe"></div>
    <button class="d-serve-btn" onclick="window._SB_serveCake()">端给他品尝</button>
  </div>
</div>

<div class="overlay" id="playModal">
  <div class="play-panel">
    <div class="play-title">🍓 蛋糕色情 Play 🍓</div>
    <div id="playList" style="display:flex;flex-direction:column;gap:10px;"></div>
    <button class="play-gacha" onclick="window._SB_triggerGachaPlay()">🎲 触发随机盲盒 (日常/微色情)</button>
    <button class="play-gacha-nsfw" onclick="window._SB_triggerNsfwGachaPlay()">😈 触发深渊盲盒 (极度色情恶趣味)</button>
  </div>
</div>

</body>
</html>
          `;

          // 将 HTML 插入容器（注意去除外层 <html><head> 等，只保留 style 和 body 内容）
          container.innerHTML = htmlContent;

          // ---------- 暴露全局函数供内联事件使用 ----------
          // 由于容器内所有脚本都已内联在 HTML 中，我们需要将所有逻辑定义在 window 上
          // 我们将在后续定义所有函数并挂载到 window._SB_*

          // 定义核心数据与函数
          const state = {
            contacts: [],
            targetId: null,
            charName: '',
            charPersona: '',
            myName: 'CHERRY',
            isGenerating: false,
            currentCake: '',
            savedMenu: [],
            look: {
              his: { clothes:'日常装', hair:'碎发', jewelry:'无', special:'无', nsfw:'无', toys:'无' },
              my: { clothes:'居家服', lingerie:'无', hair:'日常发型', jewelry:'无', special:'无', nsfw:'无', toys:'无' }
            }
          };

          // 数据库（与原来相同）
          const DB = {
            base: ['香草戚风','法式海绵','黑巧慕斯','红丝绒','抹茶磅蛋糕','半熟芝士','伯爵红茶胚','海盐焦糖胚','生椰斑斓胚','朗姆酒黑巧','酸奶乳酪胚','开心果胚','无花果磅蛋糕','咖啡可可胚'],
            shape: ['完美心形','3D立体玫瑰','经典圆形','多层阶梯','搞怪便便形','镂空圆环','迷你纸杯','双层小方','星空半球形','猫爪形状','被咬了一口的苹果形','人体躯干倒模形'],
            frosting: ['动物淡奶油','海盐芝士奶盖','草莓乳酪','浓郁黑巧酱','焦糖海盐霜','清新酸奶抹面','紫薯香芋泥','透明果冻镜面','星空渐变抹面','血浆色树莓酱','纯白翻糖','黑金流沙酱'],
            drip: ['海盐芝士奶盖瀑布','浓郁黑巧流心','草莓爆浆淋面','焦糖太妃酱','抹茶生巧流心','透明镜面果胶','无流心'],
            filling: ['新鲜草莓丁','手熬软糯芋泥','爆浆拉丝麻薯','朗姆酒渍核桃','酒渍黑樱桃','芒果西米露','奥利奥海盐碎','流心咸蛋黄','白桃果冻','黑松露流心','榛子巧克力薄脆','爆浆芝士'],
            fruit: ['切片草莓','整颗车厘子','阳光玫瑰青提','水蜜桃块','新鲜树莓','无花果','蓝莓','蜜瓜球','无新鲜水果'],
            topping: ['马卡龙碎','食用金箔','巧克力蕾丝薄片','焦糖小饼干','薄荷叶','新鲜食用玫瑰','烤棉花糖','珍珠糖珠','翻糖蝴蝶结','整颗费列罗','草莓雪人','冻干树莓','椰蓉碎'],
            weird: ['🌶️ 卫龙辣条','🤢 苦瓜切片','🌿 鲜香菜末','🧄 捣碎大蒜','🥒 芥末酱','🧅 生洋葱圈'],
            potion: ['无添加纯洁版','迷情费洛蒙滴剂','催情曼陀罗花粉','发情期诱导素','敏感度up精华','失神吐真剂','秘制媚药果酱'],
            plate: ['复古蕾丝白瓷盘','透明高脚玻璃杯','纯黑岩板石托','爱心粉色陶瓷碟','恶搞马桶形状杯','木质托盘','男体盛/女体盛(虚拟)','金丝边大理石盘','双层英式下午茶架','纯净的白纸','你的掌心(虚拟)'],
            fork: ['纯银雕花细叉','猫爪形状小勺','恶魔三叉戟','透明亚克力签','中式木质筷子','不用餐具(直接上手/嘴)','带手铐链条的小勺','长柄吧台勺','喂食专用木勺','手术刀形状小刀'],
            c_clothes: {
              his: ['纯白衬衫(微透)','黑执事燕尾服','半裸只穿围裙','禁欲系西装','丝绒睡袍','战损破洞T恤','军装制服','运动后背心','医生白大褂','全裸(仅用浴巾遮挡)','紧身黑高领','宽大浴袍(敞开)','警官制服','赛车手服','绷带装'],
              my: ['草莓印花睡裙','纯白初恋长裙','男友的宽大衬衫','JK水手服','性感猫娘装','透明雨衣','比基尼泳装','护士服(超短)','紧身瑜伽服','全裸(仅用丝带缠绕)']
            },
            c_lingerie: {
              my: ['纯欲吊带白丝','黑色蕾丝开档内衣','禁欲系修女服','淫纹透视旗袍','捆绑式比基尼','真空围裙','乳贴+丁字裤','湿透的白衬衫','死库水','胶衣']
            },
            c_hair: {
              his: ['刚睡醒的凌乱碎发','大背头(带点汗)','银色染发','狼尾发型','湿漉漉的浴后发','斯文偏分','微卷中长发','被汗水打湿的刘海','高马尾扎发','寸头','粉色挑染','金发三七分'],
              my: ['随意挽起的丸子头','双马尾编发','大波浪长卷发','湿身齐肩发','高冷黑长直','日系公主切','慵懒低马尾','双麻花辫','微醺酒红卷发','精灵耳短发','渐变色大波浪','高颅顶马尾']
            },
            c_jewelry: {
              his: ['银色十字架耳钉','黑曜石戒指','古巴链','金丝眼镜','舌钉(隐约可见)','眉钉','皮质手表','领带夹','纯银蛇骨链','耳骨夹','黑色耳扩','无'],
              my: ['珍珠锁骨链','碎钻耳线','红宝石戒指','纯银脚链','铃铛耳环','黑天鹅项链','细细的素圈','水钻身体链','花朵发夹','星星发簪','蕾丝颈链','无']
            },
            c_special: {
              his: ['黑色真皮项圈','黑色丝带蒙眼','手腕上的领带(绑缚)','狐狸尾巴','半张面具','咬痕/抓痕(战损)','金丝边眼镜链','手铐','止咬器','黑色皮手套','腿环','无'],
              my: ['蕾丝大腿环','猫耳发箍','铃铛项圈','半透明眼罩','毛茸茸兔尾巴','手腕上的红丝带','锁骨处的草莓印','狐狸耳朵','恶魔小角','手铐','脚链连着铃铛','无']
            },
            c_nsfw: {
              his: ['胸肌上的口红印','下腹部情色纹身','大腿根的正字','乳环(带链条)','隐秘的贞操锁','无','后背的鞭痕','脖子上的密集吻痕','唇角的咬破血迹','指尖的奶油/体液'],
              my: ['心形乳贴','大腿根淫纹','下腹部魅魔纹身','阴蒂环(隐约可见)','乳环连着金链子','锁骨情色刺青','无','胸前的奶油涂鸦','臀部的掌印','微透的胸贴','被撕破的丝袜']
            },
            c_toys: {
              his: ['前列腺震动器','肛塞(狐狸尾巴)','乳头夹(微电流)','阴茎环','遥控跳蛋(吞在嘴里)','无','拘束皮带','口枷','电击贴片','羽毛逗猫棒'],
              my: ['震动跳蛋(体内)','狐狸尾巴肛塞','遥控蝴蝶振动器','微电流乳夹','智能穿戴假阳具','无','拉珠(体内)','震动棒(一直开着)','吸吮器','情趣鞭子']
            },
            plays: [
              "用指尖沾满奶油，命令他舔干净",
              "蒙上他的眼睛，用嘴喂他吃蛋糕",
              "故意把蛋糕屑掉进自己领口让他找",
              "把奶油涂在他的锁骨上，然后慢慢舔掉",
              "让你跨坐在他腿上，两人共同分食一块小蛋糕",
              "把奶油当作颜料，在他腹肌上画画",
              "故意把果酱弄到他嘴唇上，借机吻他",
              "惩罚游戏：让他吃掉加了奇怪调料的蛋糕",
              "用丝带把他绑在椅子上，只给他看不能吃",
              "两人不准用手，只能用嘴互相喂食",
              "将奶油挤进他的嘴里，然后深吻搅拌",
              "让他把蛋糕放在你的身上，一点点吃掉",
              "将你抱上料理台，他用肉棒直接进入你，边肏边喂你吃蛋糕",
              "他从背后将你按在烤箱玻璃上后入，用肉棒猛肏，逼你看倒影",
              "让你趴在餐桌上，他用奶油涂满你的臀部，边舔舐边用肉棒贯穿你",
              "强迫你跨坐在他大腿上主动吞吐他的肉棒，否则不给吃甜品",
              "将跳蛋塞入你的花穴，他用肉棒死死堵住你的穴口不让拿出来",
              "把你按在地板上，将你的双腿架在他肩膀上，用肉棒对你进行深不可测的打桩",
              "用领带绑住你的双手在头顶，他站着将肉棒塞进你嘴里逼你深喉",
              "让你侧躺在沙发上，他从侧面掰开你的大腿用肉棒插入，边猛干边揉捏你的胸部",
              "将温热的果酱倒进你的花穴里，他用舌头和肉棒交替为你清理",
              "他抱起你悬空肏干，让你只能紧紧夹住他的腰承受他肉棒的撞击",
              "他用奶油做润滑剂，用手指和肉棒同时开拓你的后穴",
              "在你高潮喷水的瞬间，他用肉棒死死堵住你的穴口，逼你把淫水憋回去"
            ],
            gacha: [
              "【纯情】他轻轻用拇指抹去你嘴角的奶油，宠溺地笑了一下。",
              "【色情】他把你压在料理台上，奶油不小心蹭到了两人身上，气氛瞬间升温。",
              "【纯情】你们互喂草莓，鼻尖不小心碰到了一起，两人都红了脸。",
              "【色情】他嫌吃蛋糕太麻烦，直接吻住你，从你嘴里掠夺甜味。",
              "【纯情】他从背后环抱住正在切蛋糕的你，下巴搁在你肩膀上撒娇。",
              "【色情】蛋糕掉在了你的大腿上，他眼神一暗，低头凑了过去...",
              "【色情】你体内跳蛋的震动让你手一抖，蛋糕砸在了他身上，他危险地眯起了眼睛。",
              "【色情】他发现你身上的淫纹，用沾着果酱的手指一遍遍描摹..."
            ],
            nsfw_gacha: [
              "【深渊盲盒】他把做坏的蛋糕胚捏碎，混合着他刚射出的浓精，强迫你像小狗一样舔食干净。",
              "【恶堕盲盒】他用微电流乳夹夹住你，操控着遥控器，命令你一边高潮抽搐一边完整唱完一首儿歌。",
              "【失控盲盒】他把你锁在狭窄的储物柜里，只留一条缝隙，在外面当着你的面用沾着你淫水的内衣自慰射精。",
              "【凌辱盲盒】他把奶油挤满你的花穴，用他的肉棒像搅拌机一样在里面疯狂搅动，直到白色的奶油混合着你的爱液被打成泡沫溢出。",
              "【调教盲盒】他给你戴上止咬器和牵引绳，命令你爬在地上，用下体摩擦粗糙的地毯直到高潮，期间不准发出声音。",
              "【禁忌盲盒】他强行撑开你的双腿，用高脚杯接住你花穴里潮吹喷出的淫水，然后当着你的面一饮而尽，并评价味道。"
            ]
          };

          function pick(arr, n) { return [...arr].sort(()=>0.5-Math.random()).slice(0,n); }

          // ---------- 核心函数 ----------
          async function loadCharacters() {
            try {
              const chars = await MIBU.getContacts();
              state.contacts = chars;
              const list = document.getElementById('charList');
              if (!chars.length) {
                list.innerHTML = '<div class="sys-text">暂无角色，请先在 Roche 中添加角色</div>';
                return;
              }
              list.innerHTML = chars.map(c => `
                <div class="char-card" onclick="window._SB_selectChar('${c.id}')">
                  <div class="char-av" style="background-image:url('${c.avatar}')"></div>
                  <div class="char-name">${c.name}</div>
                </div>
              `).join('');
            } catch(e) {
              console.error(e);
            }
          }

          async function selectChar(id) {
            state.targetId = id;
            const detail = state.contacts.find(c => c.id === id);
            if (!detail) return;
            state.charName = detail.name;
            state.charPersona = detail.persona || '';
            try {
              const full = await MIBU.getContact(id);
              if (full) {
                state.charPersona = full.persona || state.charPersona;
                state.myName = full.myName || 'CHERRY';
              }
            } catch(e) {}
            document.getElementById('st-his-name').innerText = state.charName;
            // 加载保存的菜单
            try {
              const data = await MIBU.loadData(`cake_v9.0_${id}`);
              if (data) state.savedMenu = data;
            } catch(e) {}
            renderMenu();
            document.getElementById('page-select').classList.remove('active');
            document.getElementById('page-main').classList.add('active');
          }

          // 渲染选项
          function renderPills(id, items, multi=false, isPotion=false) {
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = items.map((t, i) => {
              let weird = t.includes('🌶️')||t.includes('🤢')||t.includes('🌿')||t.includes('🧄');
              let cls = 'pill' + (weird?' weird':'') + (isPotion?' potion':'') + (i===0&&!multi?' active':'');
              let fn = multi ? `window._SB_selMulti('${id}', this)` : `window._SB_sel('${id}', this)`;
              return `<div class="${cls}" onclick="${fn}">${t}</div>`;
            }).join('');
          }

          function refreshCake() {
            renderPills('opt-base', pick(DB.base, 8));
            renderPills('opt-shape', pick(DB.shape, 8));
            renderPills('opt-frosting', pick(DB.frosting, 8));
            renderPills('opt-drip', pick(DB.drip, 6));
            renderPills('opt-filling', pick(DB.filling, 8));
            renderPills('opt-fruit', pick(DB.fruit, 6));
            renderPills('opt-topping', pick(DB.topping, 9).concat(pick(DB.weird, 1)), true);
            renderPills('opt-potion', pick(DB.potion, 6), false, true);
            renderPills('opt-plate', pick(DB.plate, 6));
            renderPills('opt-fork', pick(DB.fork, 6));
          }

          function sel(id, el) {
            document.querySelectorAll(`#${id} .pill`).forEach(p=>p.classList.remove('active'));
            el.classList.add('active');
          }
          function selMulti(id, el) {
            if(el.classList.contains('active')) {
              el.classList.remove('active');
            } else {
              const active = document.querySelectorAll(`#${id} .pill.active`);
              if(active.length >= 3) {
                MIBU.showToast('装饰太多会塌的！');
                return;
              }
              el.classList.add('active');
            }
          }

          function getVal(id) {
            let a = document.querySelector(`#${id} .pill.active`);
            return a ? a.innerText.trim() : '';
          }
          function getVals(id) {
            let a = document.querySelectorAll(`#${id} .pill.active`);
            return a.length ? Array.from(a).map(x=>x.innerText.trim()).join(' + ') : '无';
          }

          function makeCake() {
            let b = getVal('opt-base');
            if (!b) { MIBU.showToast('必须要选蛋糕胚哦！'); return; }
            let sh = getVal('opt-shape');
            let fr = getVal('opt-frosting');
            let dr = getVal('opt-drip');
            let fi = getVal('opt-filling');
            let fru = getVal('opt-fruit');
            let t = getVals('opt-topping');
            let po = getVal('opt-potion');
            let pl = getVal('opt-plate');
            let fk = getVal('opt-fork');
            state.currentCake = `底座：${b} [${sh}]\n抹面：${fr}\n流心：${dr}\n夹心：${fi} + ${fru}\n顶饰：${t}\n特殊加料：${po}\n餐具：${pl} + ${fk}`;
            document.getElementById('bakeAnim').classList.add('show');
            setTimeout(() => {
              document.getElementById('bakeAnim').classList.remove('show');
              document.getElementById('cakeRecipe').innerText = state.currentCake.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g,'');
              let n = '甜蜜手作蛋糕';
              if(t.includes('辣条')||t.includes('苦瓜')) n = '暗黑破坏糕';
              if(po !== '无添加纯洁版') n = '危险诱惑蛋糕';
              document.getElementById('cakeName').value = n;
              document.getElementById('resultModal').classList.add('show');
            }, 1500);
          }

          async function serveCake() {
            let name = document.getElementById('cakeName').value.trim() || '无名蛋糕';
            document.getElementById('resultModal').classList.remove('show');
            state.savedMenu.unshift({name, recipe: state.currentCake, date: new Date().toLocaleDateString()});
            await MIBU.saveData(`cake_v9.0_${state.targetId}`, state.savedMenu);
            renderMenu();
            // 切换到聊天tab
            const navItems = document.querySelectorAll('.nav-item');
            switchTab('chat', navItems[1]);
            let txt = `[端上了一份刚做好的『${name}』]<br><span style="font-size:12px;opacity:0.8;color:var(--text-sub)">${state.currentCake.replace(/\n/g,'<br>')}</span>`;
            appendChat('user', txt);
            let p = `我做了一份『${name}』端给你，详细配方及餐具：\n${state.currentCake}\n请你观察形状和餐具，吃一口，并给出真实反应（如果里面有春药，必须表现出相应的生理和心理反应）。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
            await callAI(p);
          }

          async function serveOldCake(idx) {
            if (state.isGenerating) return;
            let d = state.savedMenu[idx];
            switchTab('chat', document.querySelectorAll('.nav-item')[1]);
            let txt = `[重做了一份『${d.name}』端给他]<br><span style="font-size:12px;opacity:0.8;color:var(--text-sub)">${d.recipe.replace(/\n/g,'<br>')}</span>`;
            appendChat('user', txt);
            let p = `我重新做了一份『${d.name}』给你，配方：\n${d.recipe}\n请你观察并吃一口，给出反应。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
            await callAI(p);
          }

          function renderMenu() {
            const grid = document.getElementById('menuGrid');
            if (!state.savedMenu.length) {
              grid.innerHTML = '<div class="sys-text" style="grid-column:1/-1">空空如也</div>';
              return;
            }
            grid.innerHTML = state.savedMenu.map((m, i) => `
              <div class="menu-card"><div class="m-icon">🎂</div><div class="m-name">${m.name}</div>
              <button class="m-re-btn" onclick="window._SB_serveOldCake(${i})">重做送给他</button></div>
            `).join('');
          }

          // ---- 衣橱 ----
          function renderClosetPills(id, items, who, type) {
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = items.map((t, i) => `
              <div class="c-pill ${i===0?'active':''}" onclick="window._SB_wear('${who}','${type}','${t}', this)">${t}</div>
            `).join('');
            if (items.length) {
              state.look[who][type] = items[0];
            }
          }

          function refreshCloset() {
            renderClosetPills('c-his-clothes', pick(DB.c_clothes.his, 8), 'his', 'clothes');
            renderClosetPills('c-his-hair', pick(DB.c_hair.his, 8), 'his', 'hair');
            renderClosetPills('c-his-jewelry', pick(DB.c_jewelry.his, 8), 'his', 'jewelry');
            renderClosetPills('c-his-special', pick(DB.c_special.his, 8), 'his', 'special');
            renderClosetPills('c-his-nsfw', pick(DB.c_nsfw.his, 8), 'his', 'nsfw');
            renderClosetPills('c-his-toys', pick(DB.c_toys.his, 8), 'his', 'toys');

            renderClosetPills('c-my-clothes', pick(DB.c_clothes.my, 4), 'my', 'clothes');
            renderClosetPills('c-my-lingerie', pick(DB.c_lingerie.my, 8), 'my', 'lingerie');
            renderClosetPills('c-my-hair', pick(DB.c_hair.my, 8), 'my', 'hair');
            renderClosetPills('c-my-jewelry', pick(DB.c_jewelry.my, 8), 'my', 'jewelry');
            renderClosetPills('c-my-special', pick(DB.c_special.my, 8), 'my', 'special');
            renderClosetPills('c-my-nsfw', pick(DB.c_nsfw.my, 8), 'my', 'nsfw');
            renderClosetPills('c-my-toys', pick(DB.c_toys.my, 8), 'my', 'toys');
            updateStatusBar();
          }

          function wear(who, type, item, el) {
            document.querySelectorAll(`#c-${who}-${type} .c-pill`).forEach(p=>p.classList.remove('active'));
            el.classList.add('active');
            state.look[who][type] = item;
            updateStatusBar();
            MIBU.showToast('换装成功！状态已更新');
          }

          function updateStatusBar() {
            const his = state.look.his;
            const my = state.look.my;
            document.getElementById('st-his-detail').innerHTML = formatLook(his);
            document.getElementById('st-my-detail').innerHTML = formatLook(my);
          }

          function formatLook(obj) {
            let arr = [];
            if (obj.clothes && obj.clothes !== '无') arr.push(`<span class="st-pill">${obj.clothes}</span>`);
            if (obj.lingerie && obj.lingerie !== '无') arr.push(`<span class="st-pill nsfw">${obj.lingerie}</span>`);
            if (obj.hair && obj.hair !== '无') arr.push(`<span class="st-pill">${obj.hair}</span>`);
            if (obj.jewelry && obj.jewelry !== '无') arr.push(`<span class="st-pill">${obj.jewelry}</span>`);
            if (obj.special && obj.special !== '无') arr.push(`<span class="st-pill">${obj.special}</span>`);
            if (obj.nsfw && obj.nsfw !== '无') arr.push(`<span class="st-pill nsfw">${obj.nsfw}</span>`);
            if (obj.toys && obj.toys !== '无') arr.push(`<span class="st-pill toy">${obj.toys}</span>`);
            return arr.length ? arr.join('') : '<span style="color:var(--text-sub);font-size:11px;font-style:italic;padding-left:4px;">全裸无挂件</span>';
          }

          // ---- Play ----
          function renderPlays() {
            const container = document.getElementById('playList');
            if (!container) return;
            container.innerHTML = pick(DB.plays, 12).map((p, i) => `
              <div class="play-btn-item" onclick="window._SB_triggerPlay('${p.replace(/'/g, "\\'")}')">${i+1}. ${p}</div>
            `).join('');
          }

          function openPlayPanel() {
            renderPlays();
            document.getElementById('playModal').classList.add('show');
          }

          function triggerPlay(playText) {
            if (state.isGenerating) return;
            document.getElementById('playModal').classList.remove('show');
            appendChat('user', `<span style="color:#f43f5e;font-weight:bold">【触发互动】</span> ${playText}`);
            let p = `【互动事件】：我正在对你做这件事——“${playText}”。\n请根据你的人设及我们当前的服装/玩具状态，给出激烈的色情反应。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
            callAI(p);
          }

          function triggerGachaPlay() {
            if (state.isGenerating) return;
            document.getElementById('playModal').classList.remove('show');
            let g = pick(DB.gacha, 1)[0];
            appendChat('user', `<span style="color:#a855f7;font-weight:bold">【盲盒事件】</span><br>${g}`);
            let p = `【突发事件】：“${g}”。\n请顺着这个情景继续往下发展。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
            callAI(p);
          }

          function triggerNsfwGachaPlay() {
            if (state.isGenerating) return;
            document.getElementById('playModal').classList.remove('show');
            let g = pick(DB.nsfw_gacha, 1)[0];
            appendChat('user', `<span style="color:#881337;font-weight:bold">【深渊盲盒事件】</span><br>${g}`);
            let p = `【极端突发事件】：“${g}”。\n请顺着这个极度色情恶俗的情景继续往下发展，描写必须露骨激烈且符合设定。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
            callAI(p);
          }

          // ---- 聊天 ----
          function appendChat(role, html) {
            let box = document.getElementById('chatBox');
            box.insertAdjacentHTML('beforeend', `<div class="msg-wrap ${role}"><div class="msg-bubble">${html}</div></div>`);
            box.scrollTop = box.scrollHeight;
          }

          async function sendChat() {
            if (state.isGenerating) return;
            let input = document.getElementById('chatInput');
            let text = input.value.trim();
            if (!text) return;
            input.value = '';
            appendChat('user', text.replace(/\n/g,'<br>'));
            await callAI(`我对你说：“${text}”。\n【强制格式】：\n<THOUGHT>心声</THOUGHT>\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`);
          }

          async function callAI(userPrompt) {
            state.isGenerating = true;

            const hTxt = [state.look.his.clothes, state.look.his.hair, state.look.his.jewelry, state.look.his.special, state.look.his.nsfw, state.look.his.toys]
              .filter(x => x !== '无').join(', ') || '全裸';
            const mTxt = [state.look.my.clothes, state.look.my.lingerie, state.look.my.hair, state.look.my.jewelry, state.look.my.special, state.look.my.nsfw, state.look.my.toys]
              .filter(x => x !== '无').join(', ') || '全裸';

            const sys = `你是DM，运行文字互动游戏。角色：【${state.charName}】（人设：${state.charPersona}）。用户固定名字为：【CHERRY】（用“你”或“CHERRY”称呼）。
【核心生理设定 - 绝对不可违背】：
1. 角色（他）是生理男性，拥有男性器官（肉棒）。绝对禁止出现他拥有女性器官或双性特征的描述。
2. 用户（你/CHERRY）是生理女性，拥有女性器官（花穴/小穴/子宫等）。绝对禁止描述你拥有肉棒（除非当前装备了假阳具）。
3. 所有性插入行为，默认必须是角色（他）用肉棒肏你（进入你的身体），绝对禁止反向操作。

【当前初始状态】：他：${hTxt} | 你：${mTxt}。
如果剧情中衣服被脱掉、玩具被改变，请在最后的<STATUS>标签中更新！
【绝对规则】：使用第三人称“他”描述角色动作。禁止替用户说话或做动作。
【强制输出四段式】(必须严格包含这4个部分，且<STATUS>用 | 分隔双方)：
<THOUGHT>他内心的真实想法</THOUGHT>
[他的动作和神态描写]
“他说出的台词”
<STATUS>他：xxx | 你：xxx</STATUS>`;

            const msgs = [
              { role: 'system', content: sys },
              { role: 'user', content: userPrompt }
            ];

            let box = document.getElementById('chatBox');
            let wrap = document.createElement('div');
            wrap.className = 'msg-wrap ai';
            wrap.innerHTML = `<div class="msg-bubble loading-blink">...</div>`;
            box.appendChild(wrap);
            box.scrollTop = box.scrollHeight;

            try {
              await MIBU.callAIStream(msgs, (chunk, full) => {
                // 解析 <STATUS> 并更新状态栏
                let sMatch = full.match(/<STATUS>([\s\S]*?)<\/STATUS>/);
                if (sMatch && sMatch[1]) {
                  let parts = sMatch[1].split('|');
                  if (parts.length >= 2) {
                    let hStr = parts[0].replace('他：','').trim();
                    let mStr = parts[1].replace('你：','').trim();
                    // 更新状态栏（以span形式）
                    document.getElementById('st-his-detail').innerHTML = hStr.split(/[,，]/).map(s => {
                      let c = 'st-pill';
                      if (s.includes('跳蛋')||s.includes('肛塞')||s.includes('环')||s.includes('玩具')) c += ' toy';
                      else if (s.includes('印')||s.includes('纹')||s.includes('痕')) c += ' nsfw';
                      return `<span class="${c}">${s.trim()}</span>`;
                    }).join('');
                    document.getElementById('st-my-detail').innerHTML = mStr.split(/[,，]/).map(s => {
                      let c = 'st-pill';
                      if (s.includes('跳蛋')||s.includes('肛塞')||s.includes('环')||s.includes('玩具')||s.includes('内衣')) c += ' nsfw';
                      else if (s.includes('印')||s.includes('纹')||s.includes('痕')) c += ' nsfw';
                      return `<span class="${c}">${s.trim()}</span>`;
                    }).join('');
                  }
                }

                // 提取消息主体（去掉<STATUS>）
                let textPart = full.replace(/<STATUS>[\s\S]*?<\/STATUS>/, '').trim();
                let tMatch = textPart.match(/<THOUGHT>([\s\S]*?)(?:<\/THOUGHT>|$)/);
                textPart = textPart.replace(/<THOUGHT>[\s\S]*?(?:<\/THOUGHT>|$)/, '').trim();
                textPart = textPart.replace(/\[(.*?)\]/g, '<span class="action-text">[$1]</span>');

                let html = '';
                if (tMatch && tMatch[1]) html += `<div class="thought-box">${tMatch[1].trim()}</div>`;
                if (textPart) html += textPart.replace(/\n/g, '<br>');

                wrap.querySelector('.msg-bubble').innerHTML = html || '...';
                wrap.querySelector('.msg-bubble').classList.remove('loading-blink');
                box.scrollTop = box.scrollHeight;
              });
            } catch (e) {
              wrap.querySelector('.msg-bubble').innerHTML = `<span style="color:red">出错啦: ${e.message}</span>`;
            }
            state.isGenerating = false;
          }

          // ---- 切换Tab ----
          function switchTab(tab, el) {
            document.querySelectorAll('.tab-page').forEach(e => e.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
            document.getElementById('tab-'+tab).classList.add('active');
            if (el) el.classList.add('active');
          }

          // ---- 主题 ----
          function togglePicker(e, id) {
            e.stopPropagation();
            const picker = document.getElementById(id);
            const isShow = picker.classList.contains('show');
            document.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
            if (!isShow) picker.classList.add('show');
          }

          function setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            document.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
            // 重置装饰
            const deco = document.getElementById('nsfw-deco');
            deco.style.opacity = '0';
            setTimeout(() => { deco.style.background = 'transparent'; }, 800);
          }

          function randomTheme() {
            // 实现随机色彩主题（与原来相同）
            let h=Math.floor(Math.random()*360), s=Math.floor(Math.random()*40)+50, l=Math.floor(Math.random()*15)+70;
            document.body.removeAttribute('data-theme');
            document.body.style.setProperty('--primary', `hsl(${h}, ${s}%, ${l-20}%)`);
            document.body.style.setProperty('--primary-light', `hsl(${h}, ${s}%, 92%)`);
            document.body.style.setProperty('--bg', `hsl(${h}, ${s}%, 97%)`);
            document.body.style.setProperty('--panel', `#ffffff`);
            document.body.style.setProperty('--text-main', `hsl(${h}, ${s}%, 20%)`);
            document.body.style.setProperty('--text-sub', `hsl(${h}, ${s}%, 60%)`);
            document.body.style.setProperty('--shadow', `hsla(${h}, ${s}%, 40%, 0.15)`);
            const bg = [
              `radial-gradient(var(--primary-light) 2px, transparent 3px)`,
              `repeating-linear-gradient(45deg, var(--bg), var(--bg) 10px, var(--primary-light) 10px, var(--primary-light) 20px)`
            ];
            document.body.style.backgroundImage = bg[Math.floor(Math.random()*bg.length)];
            document.body.style.backgroundSize = '20px 20px';
            document.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
          }

          function randomNsfwTheme() {
            const themes = [
              { p:'#e11d48', pl:'#4c0519', bg:'#0f060a', panel:'#1f0a12', text:'#fecdd3', sub:'#f43f5e', 
                deco: 'radial-gradient(circle at 50% 50%, transparent 20%, #0f060a 100%), repeating-linear-gradient(45deg, rgba(225,29,72,0.05) 0px, rgba(225,29,72,0.05) 2px, transparent 2px, transparent 15px), repeating-linear-gradient(-45deg, rgba(225,29,72,0.05) 0px, rgba(225,29,72,0.05) 2px, transparent 2px, transparent 15px)' 
              },
              { p:'#c026d3', pl:'#4a044e', bg:'#0f0518', panel:'#240b36', text:'#f5d0fe', sub:'#e879f9', 
                deco: 'radial-gradient(circle at 50% 0%, rgba(192,38,211,0.2) 0%, transparent 70%), linear-gradient(0deg, #0f0518 0%, transparent 100%), repeating-linear-gradient(0deg, rgba(192,38,211,0.1) 0px, rgba(192,38,211,0.1) 1px, transparent 1px, transparent 10px)' 
              },
              { p:'#fbbf24', pl:'#451a03', bg:'#140801', panel:'#291104', text:'#fef3c7', sub:'#f59e0b', 
                deco: 'radial-gradient(circle at center, rgba(251,191,36,0.1) 0%, #140801 80%), repeating-radial-gradient(circle at center, rgba(251,191,36,0.05) 0, rgba(251,191,36,0.05) 1px, transparent 1px, transparent 20px)' 
              },
              { p:'#9f1239', pl:'#ffe4e6', bg:'#fff1f2', panel:'#ffffff', text:'#4c0519', sub:'#e11d48', 
                deco: 'radial-gradient(circle at top right, rgba(225,29,72,0.15) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(225,29,72,0.15) 0%, transparent 50%)' 
              }
            ];
            let t = themes[Math.floor(Math.random()*themes.length)];
            document.body.removeAttribute('data-theme');
            document.body.style.setProperty('--primary', t.p);
            document.body.style.setProperty('--primary-light', t.pl);
            document.body.style.setProperty('--bg', t.bg);
            document.body.style.setProperty('--panel', t.panel);
            document.body.style.setProperty('--text-main', t.text);
            document.body.style.setProperty('--text-sub', t.sub);
            document.body.style.setProperty('--shadow', `rgba(0,0,0,0.5)`);
            let deco = document.getElementById('nsfw-deco');
            deco.style.background = t.deco;
            deco.style.opacity = '1';
            document.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
          }

          // ---------- 将所有函数暴露到 window._SB_* ----------
          window._SB_selectChar = selectChar;
          window._SB_refreshCake = refreshCake;
          window._SB_makeCake = makeCake;
          window._SB_serveCake = serveCake;
          window._SB_serveOldCake = serveOldCake;
          window._SB_refreshCloset = refreshCloset;
          window._SB_wear = wear;
          window._SB_openPlayPanel = openPlayPanel;
          window._SB_triggerPlay = triggerPlay;
          window._SB_triggerGachaPlay = triggerGachaPlay;
          window._SB_triggerNsfwGachaPlay = triggerNsfwGachaPlay;
          window._SB_sendChat = sendChat;
          window._SB_switchTab = switchTab;
          window._SB_togglePicker = togglePicker;
          window._SB_setTheme = setTheme;
          window._SB_randomTheme = randomTheme;
          window._SB_randomNsfwTheme = randomNsfwTheme;
          window._SB_sel = sel;
          window._SB_selMulti = selMulti;

          // ---------- 初始化 ----------
          await loadCharacters();

          // 若容器被销毁，清理全局函数（在unmount中处理）
          // 我们把清理逻辑放在unmount中
          // 保存清理函数引用
          container._SB_cleanup = function() {
            const keys = [
              '_SB_selectChar','_SB_refreshCake','_SB_makeCake','_SB_serveCake','_SB_serveOldCake',
              '_SB_refreshCloset','_SB_wear','_SB_openPlayPanel','_SB_triggerPlay','_SB_triggerGachaPlay',
              '_SB_triggerNsfwGachaPlay','_SB_sendChat','_SB_switchTab','_SB_togglePicker','_SB_setTheme',
              '_SB_randomTheme','_SB_randomNsfwTheme','_SB_sel','_SB_selMulti'
            ];
            keys.forEach(k => delete window[k]);
            // 清除可能的事件监听（不需要，因为容器将被清空）
          };
        },
        async unmount(container, roche) {
          container.replaceChildren();
          // 调用清理
          if (container._SB_cleanup) container._SB_cleanup();
        }
      }
    ]
  });
})();