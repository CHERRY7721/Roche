window.RochePlugin.register({
  id: "roche-bake-workshop",
  name: "私密烘焙工坊",
  version: "9.0.0",
  apps: [
    {
      id: "bake-workshop-app",
      name: "私密烘焙工坊",
      icon: "🧩",
      async mount(container, roche) {
        // 1. 插入隔离的 CSS 样式
        const styleId = "roche-plugin-bake-style";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.innerHTML = `
            .roche-plugin-bake {
              --bg: #fff1f2;
              --panel: #ffffff;
              --primary: #f43f5e;
              --primary-light: #ffe4e6;
              --text-main: #881337;
              --text-sub: #fb7185;
              --shadow: rgba(244,63,94,0.15);
              
              width: 100%;
              height: 100%;
              background-color: var(--bg);
              color: var(--text-main);
              display: flex;
              flex-direction: column;
              overflow: hidden;
              position: relative;
              box-sizing: border-box;
            }

            /* 主题系统 */
            .roche-plugin-bake[data-theme="mint"] { --bg:#f0fdf4; --panel:#ffffff; --primary:#10b981; --primary-light:#d1fae5; --text-main:#064e3b; --text-sub:#34d399; --shadow:rgba(16,185,129,0.15); }
            .roche-plugin-bake[data-theme="berry"] { --bg:#fff1f2; --panel:#ffffff; --primary:#f43f5e; --primary-light:#ffe4e6; --text-main:#881337; --text-sub:#fb7185; --shadow:rgba(244,63,94,0.15); }
            .roche-plugin-bake[data-theme="choco"] { --bg:#fefae0; --panel:#ffffff; --primary:#d97706; --primary-light:#fef3c7; --text-main:#78350f; --text-sub:#fbbf24; --shadow:rgba(217,119,6,0.15); }
            .roche-plugin-bake[data-theme="taro"] { --bg:#faf5ff; --panel:#ffffff; --primary:#a855f7; --primary-light:#f3e8ff; --text-main:#581c87; --text-sub:#c084fc; --shadow:rgba(168,85,247,0.15); }
            .roche-plugin-bake[data-theme="night"] { --bg:#111827; --panel:#1f2937; --primary:#6366f1; --primary-light:#3730a3; --text-main:#f3f4f6; --text-sub:#818cf8; --shadow:rgba(99,102,241,0.2); }

            .roche-plugin-bake * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-tap-highlight-color:transparent; outline:none; }
            
            .roche-plugin-bake #nsfw-deco { position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; opacity:0; transition:opacity 0.8s ease, background 0.8s ease; }
            .roche-plugin-bake .page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; z-index:10; }
            .roche-plugin-bake .page.active { display:flex; animation:bakeSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
            
            @keyframes bakeSlideUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
            @keyframes bakeFadeIn { from{opacity:0; transform:scale(0.95)} to{opacity:1; transform:scale(1)} }

            /* 头部样式与退出按钮 */
            .roche-plugin-bake .header { padding:15px 20px; display:flex; justify-content:space-between; align-items:center; z-index:30; background:rgba(255,255,255,0.15); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.3); box-shadow:0 2px 10px rgba(0,0,0,0.02); }
            .roche-plugin-bake .header-title { font-weight:900; font-size:20px; color:var(--text-main); letter-spacing:1px; text-shadow:0 1px 2px rgba(255,255,255,0.5); }
            .roche-plugin-bake .header-title span { color:var(--primary); }
            .roche-plugin-bake .header-controls { display:flex; gap:10px; align-items:center; }
            .roche-plugin-bake .theme-btn, .roche-plugin-bake .exit-btn { font-size:16px; cursor:pointer; background:var(--panel); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px var(--shadow); transition:transform 0.2s; border:1px solid var(--primary-light); }
            .roche-plugin-bake .theme-btn:active, .roche-plugin-bake .exit-btn:active { transform:scale(0.85); }
            .roche-plugin-bake .exit-btn { color: #ef4444; font-weight: bold; }

            /* 主题选择器 */
            .roche-plugin-bake .theme-picker { position:absolute; top:65px; right:20px; background:var(--panel); border-radius:24px; padding:16px; display:none; grid-template-columns:repeat(3, 1fr); gap:12px; box-shadow:0 15px 40px rgba(0,0,0,0.2); z-index:50; border:2px solid var(--primary-light); transform-origin:top right; }
            .roche-plugin-bake .theme-picker.show { display:grid; animation:bakeFadeIn 0.2s ease-out; }
            .roche-plugin-bake .theme-dot { width:36px; height:36px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); transition:transform 0.2s; }
            .roche-plugin-bake .theme-dot:active { transform:scale(0.8); }
            .roche-plugin-bake .theme-gacha { grid-column:1/-1; background:linear-gradient(45deg, #ff9a9e, #fecfef); color:#fff; border:none; padding:12px; border-radius:16px; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(255,154,158,0.4); transition:0.2s; text-shadow:0 1px 2px rgba(0,0,0,0.1); }
            .roche-plugin-bake .theme-nsfw { grid-column:1/-1; background:linear-gradient(135deg, #111, #881337); color:#fff; border:1px solid #f43f5e; padding:12px; border-radius:16px; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(136,19,55,0.5); text-shadow:0 0 5px #f43f5e; transition:0.2s; }
            .roche-plugin-bake .theme-nsfw:active, .roche-plugin-bake .theme-gacha:active { transform:scale(0.95); }

            /* 选人列表 */
            .roche-plugin-bake .char-list { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }
            .roche-plugin-bake .char-card { background:var(--panel); border-radius:20px; padding:15px; display:flex; align-items:center; gap:15px; cursor:pointer; box-shadow:0 6px 20px var(--shadow); border:2px solid transparent; transition:transform 0.2s, border-color 0.2s; }
            .roche-plugin-bake .char-card:active { transform:scale(0.96); border-color:var(--primary); }
            .roche-plugin-bake .char-av { width:60px; height:60px; border-radius:18px; background-size:cover; background-position:center; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
            .roche-plugin-bake .char-name { font-weight:900; font-size:17px; color: var(--text-main); }

            /* 导航与主视图 */
            .roche-plugin-bake .main-view { flex:1; position:relative; overflow:hidden; z-index:5; }
            .roche-plugin-bake .tab-page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; overflow-y:auto; scroll-behavior:smooth; padding-bottom:0; }
            .roche-plugin-bake .tab-page.active { display:flex; }
            .roche-plugin-bake .bottom-nav { display:flex; background:rgba(255,255,255,0.9); backdrop-filter:blur(20px); padding:10px 15px 20px; z-index:20; flex-shrink:0; border-radius:30px 30px 0 0; box-shadow:0 -5px 30px rgba(0,0,0,0.05); justify-content:space-around; border-top:1px solid rgba(255,255,255,0.6); }
            .roche-plugin-bake .nav-item { display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--text-sub); cursor:pointer; width:60px; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            .roche-plugin-bake .nav-item.active { color:var(--primary); transform:translateY(-4px); }
            .roche-plugin-bake .nav-icon { font-size:22px; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; transition:0.3s; background:transparent; }
            .roche-plugin-bake .nav-item.active .nav-icon { background:var(--primary-light); box-shadow:0 4px 12px var(--shadow); }
            .roche-plugin-bake .nav-text { font-size:11px; font-weight:900; }

            /* 顶部操作条 */
            .roche-plugin-bake .top-bar { padding:12px 20px 0; display:flex; justify-content:center; position:sticky; top:0; z-index:15; background:linear-gradient(to bottom, var(--bg) 85%, transparent); }
            .roche-plugin-bake .refresh-btn { background:linear-gradient(135deg, var(--primary), var(--primary-light)); color:#fff; border:none; padding:10px 24px; border-radius:20px; font-size:13px; font-weight:900; cursor:pointer; box-shadow:0 6px 15px var(--shadow); transition:0.2s; text-shadow:0 1px 2px rgba(0,0,0,0.1); letter-spacing:1px; }
            .roche-plugin-bake .refresh-btn:active { transform:scale(0.95); }

            /* 选项区 */
            .roche-plugin-bake .lab-container, .roche-plugin-bake .closet-container { padding:0 20px 130px; }
            .roche-plugin-bake .sec-title { font-size:13px; font-weight:900; margin:20px 0 10px; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.6); padding:6px 12px; border-radius:12px; backdrop-filter:blur(8px); color:var(--primary); box-shadow:0 2px 8px rgba(0,0,0,0.03); }
            .roche-plugin-bake .sec-title::before { content:''; display:block; width:5px; height:14px; background:var(--primary); border-radius:3px; }
            .roche-plugin-bake .pill-group { display:flex; flex-wrap:wrap; gap:8px; }
            .roche-plugin-bake .pill, .roche-plugin-bake .c-pill { background:var(--panel); border:1px solid var(--primary-light); color:var(--text-sub); padding:8px 14px; border-radius:18px; font-size:12px; font-weight:800; cursor:pointer; transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow:0 2px 6px rgba(0,0,0,0.02); }
            .roche-plugin-bake .pill.active, .roche-plugin-bake .c-pill.active { background:var(--primary); color:#fff; border-color:var(--primary); box-shadow:0 6px 15px var(--shadow); transform:translateY(-2px); }
            .roche-plugin-bake .pill.weird { border-color:#f87171; color:#f87171; background:rgba(254,242,242,0.8); }
            .roche-plugin-bake .pill.weird.active { background:#f87171; border-color:#f87171; color:#fff; }
            .roche-plugin-bake .pill.potion { border-color:#d946ef; color:#d946ef; background:rgba(253,244,255,0.8); }
            .roche-plugin-bake .pill.potion.active { background:#d946ef; border-color:#d946ef; color:#fff; box-shadow:0 6px 15px rgba(217,70,239,0.3); }

            .roche-plugin-bake .make-btn-wrap { position:fixed; bottom:90px; left:0; width:100%; display:flex; justify-content:center; z-index:15; pointer-events:none; }
            .roche-plugin-bake .make-btn { background:linear-gradient(135deg, var(--text-main), var(--primary)); color:#fff; border:none; padding:15px 55px; border-radius:30px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 10px 25px rgba(0,0,0,0.3); pointer-events:auto; letter-spacing:2px; transition:0.2s; }
            .roche-plugin-bake .make-btn:active { transform:scale(0.95) translateY(2px); box-shadow:0 6px 15px rgba(0,0,0,0.2); }

            /* 聊天区与状态栏 */
            .roche-plugin-bake #tab-chat { overflow: hidden; padding-bottom: 0; }
            .roche-plugin-bake .chat-page-wrapper { display:flex; flex-direction:column; height:100%; width:100%; }
            .roche-plugin-bake .status-glass-card { background:rgba(255,255,255,0.65); backdrop-filter:blur(25px); border-radius:20px; margin:12px 15px 5px; padding:12px 15px; box-shadow:0 8px 25px var(--shadow); border:1px solid rgba(255,255,255,0.9); flex-shrink:0; position:relative; height:110px; overflow-y:auto; overflow-x:hidden; }
            .roche-plugin-bake .status-glass-card::-webkit-scrollbar { width:0; height:0; display:none; }
            .roche-plugin-bake .status-glass-card::after { content:''; position:absolute; bottom:-20px; right:-10px; width:80px; height:80px; background:var(--primary-light); border-radius:50%; opacity:0.4; z-index:0; pointer-events:none; }
            .roche-plugin-bake .st-row { position:relative; z-index:1; display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; }
            .roche-plugin-bake .st-row:last-child { margin-bottom:0; padding-top:8px; border-top:1px dashed rgba(0,0,0,0.08); }
            .roche-plugin-bake .st-avatar { padding:3px 8px; border-radius:8px; font-weight:900; font-size:11px; color:#fff; flex-shrink:0; box-shadow:0 3px 8px rgba(0,0,0,0.1); letter-spacing:0.5px; display:flex; align-items:center; justify-content:center; }
            .roche-plugin-bake .st-avatar.his-av { background:var(--primary); }
            .roche-plugin-bake .st-avatar.my-av { background:linear-gradient(135deg, #f43f5e, #fb7185); }
            .roche-plugin-bake .st-info { flex:1; display:flex; flex-wrap:wrap; gap:4px; align-content:flex-start; padding-top:1px; min-height:22px; }
            .roche-plugin-bake .st-pill { font-size:10px; font-weight:800; padding:3px 7px; background:rgba(255,255,255,0.8); border:1px solid var(--primary-light); border-radius:8px; color:var(--text-main); box-shadow:0 2px 5px rgba(0,0,0,0.02); }
            .roche-plugin-bake .st-pill.nsfw { color:#f43f5e; border-color:rgba(244,63,94,0.3); background:rgba(244,63,94,0.08); }
            .roche-plugin-bake .st-pill.toy { color:#a855f7; border-color:rgba(168,85,247,0.3); background:rgba(168,85,247,0.08); }

            .roche-plugin-bake .chat-history { flex:1; overflow-y:auto; padding:10px 15px 15px; display:flex; flex-direction:column; gap:16px; scroll-behavior:smooth; }
            .roche-plugin-bake .msg-wrap { display:flex; flex-direction:column; max-width:88%; }
            .roche-plugin-bake .msg-wrap.user { align-self:flex-end; align-items:flex-end; }
            .roche-plugin-bake .msg-wrap.ai { align-self:flex-start; align-items:flex-start; }
            .roche-plugin-bake .msg-bubble { padding:12px 16px; border-radius:20px; font-size:14px; line-height:1.6; word-wrap:break-word; box-shadow:0 4px 15px rgba(0,0,0,0.05); position:relative; }
            .roche-plugin-bake .user .msg-bubble { background:var(--text-main); color:#fff; border-bottom-right-radius:4px; font-weight:500; }
            .roche-plugin-bake .ai .msg-bubble { background:var(--panel); border:1px solid var(--primary-light); border-bottom-left-radius:4px; color:var(--text-main); }
            .roche-plugin-bake .thought-box { margin-bottom:8px; font-size:12px; color:var(--primary); font-weight:800; background:var(--bg); padding:10px 14px; border-radius:14px; border:1px solid var(--primary-light); border-left:4px solid var(--primary); }
            .roche-plugin-bake .thought-box::before { content:'💭'; margin-right:6px; }
            .roche-plugin-bake .action-text { color:var(--text-sub); font-style:italic; font-size:13px; margin-bottom:6px; display:block; }

            .roche-plugin-bake .chat-input-bar { background:rgba(255,255,255,0.95); backdrop-filter:blur(15px); padding:6px 10px; display:flex; gap:10px; align-items:center; margin:0 15px 10px; border-radius:25px; box-shadow:0 6px 20px var(--shadow); border:1px solid rgba(255,255,255,0.8); flex-shrink:0; }
            .roche-plugin-bake .play-btn { background:linear-gradient(135deg, #f43f5e, #fb7185); color:#fff; border:none; width:38px; height:38px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(244,63,94,0.3); flex-shrink:0; transition:0.2s; }
            .roche-plugin-bake .play-btn:active { transform:scale(0.9); }
            .roche-plugin-bake .chat-input { flex:1; background:transparent; border:none; font-size:14px; outline:none; color:var(--text-main); font-weight:500; padding:0 6px; }
            .roche-plugin-bake .chat-input::placeholder { color:var(--text-sub); opacity:0.8; }
            .roche-plugin-bake .chat-send { background:var(--primary); color:#fff; border:none; width:38px; height:38px; border-radius:50%; font-size:16px; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:0.2s; box-shadow:0 4px 10px var(--shadow); }
            .roche-plugin-bake .chat-send:active { transform:scale(0.9); }

            /* 衣橱卡片 */
            .roche-plugin-bake .closet-card { background:var(--panel); border-radius:24px; padding:20px; box-shadow:0 8px 25px var(--shadow); border:1px solid var(--primary-light); position:relative; overflow:hidden; margin-bottom:20px; }
            .roche-plugin-bake .closet-card::before { content:''; position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:var(--bg); border-radius:50%; z-index:0; opacity:0.6; }
            .roche-plugin-bake .closet-title { text-align:center; font-weight:900; color:var(--primary); font-size:16px; margin-bottom:15px; position:relative; z-index:2; border-bottom:2px dashed var(--primary-light); padding-bottom:10px; letter-spacing:1px; }

            /* 图鉴 */
            .roche-plugin-bake .menu-grid { padding:15px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
            .roche-plugin-bake .menu-card { background:var(--panel); border-radius:20px; padding:15px; text-align:center; box-shadow:0 8px 20px var(--shadow); border:1px solid var(--primary-light); display:flex; flex-direction:column; align-items:center; }
            .roche-plugin-bake .m-icon { font-size:45px; margin-bottom:10px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
            .roche-plugin-bake .m-name { font-weight:900; font-size:14px; color:var(--text-main); margin-bottom:12px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .roche-plugin-bake .m-re-btn { background:var(--primary-light); color:var(--primary); border:none; padding:10px 12px; border-radius:14px; font-size:12px; font-weight:900; cursor:pointer; width:100%; transition:0.2s; }
            .roche-plugin-bake .m-re-btn:active { background:var(--primary); color:#fff; }

            /* 弹窗与遮罩 */
            .roche-plugin-bake .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:100; display:none; align-items:center; justify-content:center; }
            .roche-plugin-bake .overlay.show { display:flex; animation:bakeFadeIn 0.2s; }
            .roche-plugin-bake .shaker { font-size:80px; animation:bakeShake 0.4s infinite; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.3)); }
            @keyframes bakeShake { 0%,100%{transform:rotate(0deg) translateY(0)} 25%{transform:rotate(-15deg) translateY(-5px)} 75%{transform:rotate(15deg) translateY(-5px)} }

            .roche-plugin-bake .result-card { background:var(--panel); width:85%; max-width:320px; border-radius:30px; padding:30px 25px; text-align:center; position:relative; border:2px solid var(--primary-light); box-shadow:0 25px 50px rgba(0,0,0,0.3); }
            .roche-plugin-bake .d-name-input { width:100%; border:none; border-bottom:3px dashed var(--primary); text-align:center; font-size:22px; font-weight:900; color:var(--text-main); padding:8px; outline:none; margin-bottom:20px; background:transparent; transition:0.3s; }
            .roche-plugin-bake .d-name-input:focus { border-bottom-style:solid; background:var(--primary-light); border-radius:12px 12px 0 0; }
            .roche-plugin-bake .d-recipe { font-size:12px; color:var(--text-sub); line-height:1.6; background:var(--bg); padding:15px; border-radius:16px; margin-bottom:20px; text-align:left; border:1px solid rgba(0,0,0,0.05); font-weight:700; }
            .roche-plugin-bake .d-serve-btn { width:100%; background:var(--primary); color:#fff; border:none; padding:15px; border-radius:20px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 8px 25px var(--shadow); transition:0.2s; letter-spacing:1px; }
            .roche-plugin-bake .d-serve-btn:active { transform:scale(0.96); }

            .roche-plugin-bake .play-panel { background:var(--panel); width:90%; max-width:360px; border-radius:25px; padding:20px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; border:2px solid var(--primary-light); box-shadow:0 20px 50px rgba(0,0,0,0.3); }
            .roche-plugin-bake .play-title { text-align:center; font-size:16px; font-weight:900; color:var(--primary); margin-bottom:10px; }
            .roche-plugin-bake .play-btn-item { background:var(--bg); border:1px solid var(--primary-light); padding:12px 15px; border-radius:16px; font-size:13px; font-weight:800; color:var(--text-main); text-align:left; cursor:pointer; transition:0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.02); }
            .roche-plugin-bake .play-btn-item:active { background:var(--primary-light); transform:scale(0.97); }

            .roche-plugin-bake .play-gacha { background:linear-gradient(135deg, #a855f7, #c084fc); color:#fff; border:none; padding:15px; border-radius:18px; font-size:14px; font-weight:900; text-align:center; cursor:pointer; margin-top:5px; box-shadow:0 6px 20px rgba(168,85,247,0.3); transition:0.2s; }
            .roche-plugin-bake .play-gacha-nsfw { background:linear-gradient(135deg, #881337, #f43f5e); color:#fff; border:none; padding:15px; border-radius:18px; font-size:14px; font-weight:900; text-align:center; cursor:pointer; margin-top:5px; box-shadow:0 6px 20px rgba(244,63,94,0.4); transition:0.2s; text-shadow:0 1px 3px rgba(0,0,0,0.3); }
            .roche-plugin-bake .play-gacha:active, .roche-plugin-bake .play-gacha-nsfw:active { transform:scale(0.97); }

            .roche-plugin-bake .sys-text { text-align:center; font-size:12px; color:var(--text-sub); margin:10px 0; font-weight:800; }
            .roche-plugin-bake .loading-blink { animation:bakeBlink 1.5s infinite; opacity:0.6; }
            @keyframes bakeBlink { 50%{opacity:0.2} }
          `;
          document.head.appendChild(style);
        }

        // 2. 渲染核心 HTML 结构
        container.innerHTML = `
          <div class="roche-plugin-bake" data-theme="berry">
            <div id="nsfw-deco"></div>

            <!-- 页面 1：选人 -->
            <div class="page active" id="page-select">
              <div class="header">
                <div class="header-title">Sweet <span>Bite.</span></div>
                <div class="header-controls">
                  <div class="theme-btn" id="theme-btn-select">🎨</div>
                  <div class="exit-btn" id="exit-btn-select">✕</div>
                </div>
              </div>
              <div class="theme-picker" id="tp1">
                <div class="theme-dot" style="background:#10b981" data-theme="mint"></div>
                <div class="theme-dot" style="background:#f43f5e" data-theme="berry"></div>
                <div class="theme-dot" style="background:#d97706" data-theme="choco"></div>
                <div class="theme-dot" style="background:#a855f7" data-theme="taro"></div>
                <div class="theme-dot" style="background:#6366f1" data-theme="night"></div>
                <button class="theme-gacha" id="gacha-btn-1">🎲 绝美盲盒主题</button>
                <button class="theme-nsfw" id="nsfw-gacha-btn-1">😈 色情盲盒主题</button>
              </div>
              <div class="sys-text" style="text-align:left; padding:0 24px;">想和谁在厨房度过甜蜜时光？</div>
              <div class="char-list" id="charList">加载中...</div>
            </div>

            <!-- 页面 2：主游戏 -->
            <div class="page" id="page-main">
              <div class="header">
                <div class="header-title" id="roomTitle">私密烘焙坊</div>
                <div class="header-controls">
                  <div class="theme-btn" id="theme-btn-main">🎨</div>
                  <div class="exit-btn" id="exit-btn-main">✕</div>
                </div>
              </div>
              <div class="theme-picker" id="tp2">
                <div class="theme-dot" style="background:#10b981" data-theme="mint"></div>
                <div class="theme-dot" style="background:#f43f5e" data-theme="berry"></div>
                <div class="theme-dot" style="background:#d97706" data-theme="choco"></div>
                <div class="theme-dot" style="background:#a855f7" data-theme="taro"></div>
                <div class="theme-dot" style="background:#6366f1" data-theme="night"></div>
                <button class="theme-gacha" id="gacha-btn-2">🎲 绝美盲盒主题</button>
                <button class="theme-nsfw" id="nsfw-gacha-btn-2">😈 色情盲盒主题</button>
              </div>
              
              <div class="main-view">
                <!-- Tab 1: 做蛋糕 -->
                <div class="tab-page active" id="tab-bake">
                  <div class="top-bar"><button class="refresh-btn" id="refresh-cake-btn">✨ 换一批烘焙灵感</button></div>
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
                  <div class="make-btn-wrap"><button class="make-btn" id="make-cake-btn">🪄 烘焙出炉</button></div>
                </div>

                <!-- Tab 2: 互动 -->
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
                      <button class="play-btn" id="play-panel-btn">🍰</button>
                      <input type="text" class="chat-input" id="chatInput" placeholder="输入你的行动或话语...">
                      <button class="chat-send" id="chat-send-btn">➤</button>
                    </div>
                  </div>
                </div>

                <!-- Tab 3: 衣橱 -->
                <div class="tab-page" id="tab-closet">
                  <div class="top-bar"><button class="refresh-btn" id="refresh-closet-btn">✨ 一键刷新衣橱盲盒</button></div>
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

                <!-- Tab 4: 图鉴 -->
                <div class="tab-page" id="tab-menu">
                  <div class="sys-text" style="margin-top:20px;">你们的专属甜品图鉴</div>
                  <div class="menu-grid" id="menuGrid"></div>
                </div>
              </div>

              <div class="bottom-nav" id="bottom-nav-bar">
                <div class="nav-item active" data-tab="bake"><div class="nav-icon">🎂</div><div class="nav-text">做蛋糕</div></div>
                <div class="nav-item" data-tab="chat"><div class="nav-icon">💬</div><div class="nav-text">互动</div></div>
                <div class="nav-item" data-tab="closet"><div class="nav-icon">👗</div><div class="nav-text">衣橱</div></div>
                <div class="nav-item" data-tab="menu"><div class="nav-icon">📖</div><div class="nav-text">图鉴</div></div>
              </div>
            </div>

            <!-- 全局弹窗与遮罩 -->
            <div class="overlay" id="bakeAnim"><div style="text-align:center"><div class="shaker">🧑‍🍳</div><div style="color:#fff;font-weight:900;font-size:18px;margin-top:15px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">正在精心烘烤中...</div></div></div>
            <div class="overlay" id="resultModal">
              <div class="result-card">
                <div style="font-size:65px;margin-bottom:15px;filter:drop-shadow(0 5px 15px rgba(0,0,0,0.2))">🎂</div>
                <input type="text" class="d-name-input" id="cakeName" value="私房手作蛋糕">
                <div class="d-recipe" id="cakeRecipe"></div>
                <button class="d-serve-btn" id="serve-cake-btn">端给他品尝</button>
              </div>
            </div>

            <div class="overlay" id="playModal">
              <div class="play-panel">
                <div class="play-title">🍓 蛋糕色情 Play 🍓</div>
                <div id="playList" style="display:flex;flex-direction:column;gap:10px;"></div>
                <button class="play-gacha" id="play-gacha-btn">🎲 触发随机盲盒 (日常/微色情)</button>
                <button class="play-gacha-nsfw" id="play-gacha-nsfw-btn">😈 触发深渊盲盒 (极度色情恶趣味)</button>
              </div>
            </div>
          </div>
        `;

        // 3. 插件运行状态及变量
        const root = container.querySelector(".roche-plugin-bake");
        let contacts = [];
        let targetId = null;
        let charName = '';
        let charPersona = '';
        let isGenerating = false;
        let currentCake = '';
        let savedMenu = [];

        let look = {
          his: { clothes:'日常装', hair:'碎发', jewelry:'无', special:'无', nsfw:'无', toys:'无' },
          my: { clothes:'居家服', lingerie:'无', hair:'日常发型', jewelry:'无', special:'无', nsfw:'无', toys:'无' }
        };

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
            "【禁忌盲盒】他强行撑开你的双腿，用高脚杯接住你花穴里潮吹喷出的淫水，然后当着你的面一饮一尽，并评价味道。"
          ]
        };

        // 4. 工具函数
        function pick(arr, n) { return [...arr].sort(()=>0.5-Math.random()).slice(0,n); }

        function togglePicker(e, pickerId) {
          e.stopPropagation();
          const picker = root.querySelector("#" + pickerId);
          const isShow = picker.classList.contains('show');
          root.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
          if (!isShow) picker.classList.add('show');
        }

        function resetThemeStyles() {
          root.removeAttribute('style');
          let deco = root.querySelector('#nsfw-deco');
          if(deco) {
            deco.style.opacity = '0';
            setTimeout(() => { if(deco.style.opacity === '0') deco.style.background = 'transparent'; }, 800);
          }
        }

        function setTheme(theme) {
          resetThemeStyles();
          root.setAttribute('data-theme', theme);
          root.querySelectorAll('.theme-picker').forEach(p=>p.classList.remove('show'));
        }

        function randomTheme() {
          resetThemeStyles();
          let h=Math.floor(Math.random()*360), s=Math.floor(Math.random()*40)+50, l=Math.floor(Math.random()*15)+70;
          root.removeAttribute('data-theme');
          root.style.setProperty('--primary', `hsl(${h}, ${s}%, ${l-20}%)`);
          root.style.setProperty('--primary-light', `hsl(${h}, ${s}%, 92%)`);
          root.style.setProperty('--bg', `hsl(${h}, ${s}%, 97%)`);
          root.style.setProperty('--panel', `#ffffff`);
          root.style.setProperty('--text-main', `hsl(${h}, ${s}%, 20%)`);
          root.style.setProperty('--text-sub', `hsl(${h}, ${s}%, 60%)`);
          root.style.setProperty('--shadow', `hsla(${h}, ${s}%, 40%, 0.15)`);
          
          const bg = [
            `radial-gradient(var(--primary-light) 2px, transparent 3px)`,
            `repeating-linear-gradient(45deg, var(--bg), var(--bg) 10px, var(--primary-light) 10px, var(--primary-light) 20px)`
          ];
          root.style.backgroundImage = bg[Math.floor(Math.random()*bg.length)];
          root.style.backgroundSize = '20px 20px';
          root.querySelectorAll('.theme-picker').forEach(p=>p.classList.remove('show'));
        }

        function randomNsfwTheme() {
          resetThemeStyles();
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
          root.removeAttribute('data-theme');
          root.style.setProperty('--primary', t.p);
          root.style.setProperty('--primary-light', t.pl);
          root.style.setProperty('--bg', t.bg);
          root.style.setProperty('--panel', t.panel);
          root.style.setProperty('--text-main', t.text);
          root.style.setProperty('--text-sub', t.sub);
          root.style.setProperty('--shadow', `rgba(0,0,0,0.5)`);
          
          let deco = root.querySelector('#nsfw-deco');
          deco.style.background = t.deco;
          deco.style.opacity = '1';
          root.querySelectorAll('.theme-picker').forEach(p=>p.classList.remove('show'));
        }

        // 5. 初始化与选人
        async function init() {
          try {
            // 使用 Roche 官方 API 获取角色列表
            contacts = await roche.character.list();
            if (contacts && contacts.length > 0) {
              root.querySelector('#charList').innerHTML = contacts.map(c => `
                <div class="char-card" data-id="${c.id}">
                  <div class="char-av" style="background-image:url('${c.avatar || `https://picsum.photos/seed/${c.id}/100/100`}')"></div>
                  <div class="char-name">${c.handle || c.name}</div>
                </div>
              `).join('');

              // 绑定选人点击事件
              root.querySelectorAll('.char-card').forEach(card => {
                card.addEventListener('click', () => {
                  const cid = card.getAttribute('data-id');
                  selectChar(cid);
                });
              });
            } else {
              root.querySelector('#charList').innerHTML = '<div class="sys-text">未找到可互动的角色，请先创建或添加角色</div>';
            }
          } catch(e) {
            root.querySelector('#charList').innerHTML = `<div class="sys-text">加载角色失败: ${e.message}</div>`;
          }
          refreshCake(); 
          refreshCloset(); 
          renderPlays(); 
          updateStatusBar();
        }

        async function selectChar(id) {
          targetId = id; 
          const detail = await roche.character.get(id);
          charName = detail.handle || detail.name; 
          charPersona = detail.persona || detail.bio || '';
          
          root.querySelector('#st-his-name').innerText = charName;
          root.querySelector('#roomTitle').innerText = `与 ${charName} 的私密烘焙坊`;
          
          try { 
            // 使用 Roche 官方私有存储读取甜品数据
            let d = await roche.storage.get(`cake_v9.0_${targetId}`); 
            if(d) savedMenu = d; 
          } catch(e){}
          
          renderMenu();
          root.querySelector('#page-select').classList.remove('active');
          root.querySelector('#page-main').classList.add('active');
        }

        function switchTab(tab, clickedItem) {
          root.querySelectorAll('.tab-page').forEach(e=>e.classList.remove('active'));
          root.querySelectorAll('.bottom-nav .nav-item').forEach(e=>e.classList.remove('active'));
          root.querySelector('#tab-'+tab).classList.add('active');
          clickedItem.classList.add('active');
        }

        // 6. 蛋糕烘焙系统
        function renderPills(id, items, multi=false, isPotion=false) {
          root.querySelector('#' + id).innerHTML = items.map((t,i)=>{
            let weird = t.includes('🌶️')||t.includes('🤢')||t.includes('🌿')||t.includes('🧄');
            let cls = 'pill' + (weird?' weird':'') + (isPotion?' potion':'') + (i===0&&!multi?' active':'');
            return `<div class="${cls}" data-val="${t}">${t}</div>`;
          }).join('');

          // 绑定点击事件
          root.querySelectorAll(`#${id} .pill`).forEach(pill => {
            pill.addEventListener('click', () => {
              if (multi) {
                if(pill.classList.contains('active')) {
                  pill.classList.remove('active');
                } else {
                  if(root.querySelectorAll(`#${id} .pill.active`).length >= 3) {
                    return roche.ui.toast('装饰太多会塌的！');
                  }
                  pill.classList.add('active');
                }
              } else {
                root.querySelectorAll(`#${id} .pill`).forEach(p=>p.classList.remove('active'));
                pill.classList.add('active');
              }
            });
          });
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

        function getVal(id) { 
          let a = root.querySelector(`#${id} .pill.active`); 
          return a ? a.getAttribute('data-val').trim() : ''; 
        }

        function getVals(id) { 
          let a = root.querySelectorAll(`#${id} .pill.active`); 
          return a.length ? Array.from(a).map(x=>x.getAttribute('data-val').trim()).join(' + ') : '无'; 
        }

        function makeCake() {
          let b=getVal('opt-base'), sh=getVal('opt-shape'), fr=getVal('opt-frosting'), dr=getVal('opt-drip'), fi=getVal('opt-filling'), fru=getVal('opt-fruit'), t=getVals('opt-topping'), po=getVal('opt-potion'), pl=getVal('opt-plate'), fk=getVal('opt-fork');
          if(!b) return roche.ui.toast('必须要选蛋糕胚哦！');
          currentCake = `底座：${b} [${sh}]\n抹面：${fr}\n流心：${dr}\n夹心：${fi} + ${fru}\n顶饰：${t}\n特殊加料：${po}\n餐具：${pl} + ${fk}`;
          root.querySelector('#bakeAnim').classList.add('show');
          setTimeout(()=>{
            root.querySelector('#bakeAnim').classList.remove('show');
            root.querySelector('#cakeRecipe').innerText = currentCake.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g,'');
            let n = '甜蜜手作蛋糕';
            if(t.includes('辣条')||t.includes('苦瓜')) n = '暗黑破坏糕';
            if(po!=='无添加纯洁版') n = '危险诱惑蛋糕';
            root.querySelector('#cakeName').value = n;
            root.querySelector('#resultModal').classList.add('show');
          }, 1500);
        }

        async function serveCake() {
          let name = root.querySelector('#cakeName').value.trim()||'无名蛋糕';
          root.querySelector('#resultModal').classList.remove('show');
          savedMenu.unshift({name, recipe:currentCake, date:new Date().toLocaleDateString()});
          await roche.storage.set(`cake_v9.0_${targetId}`, savedMenu); 
          renderMenu();
          
          switchTab('chat', root.querySelectorAll('.bottom-nav .nav-item')[1]);
          let txt = `[端上了一份刚做好的『${name}』]<br><span style="font-size:12px;opacity:0.8;color:var(--text-sub)">${currentCake.replace(/\n/g,'<br>')}</span>`;
          appendChat('user', txt);
          let p = `我做了一份『${name}』端给你，详细配方及餐具：\n${currentCake}\n请你观察形状和餐具，吃一口，并给出真实反应（如果里面有春药，必须表现出相应的生理和心理反应）。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
          await callAI(p);
        }

        async function serveOldCake(idx) {
          if(isGenerating) return; 
          let d = savedMenu[idx];
          switchTab('chat', root.querySelectorAll('.bottom-nav .nav-item')[1]);
          let txt = `[重做了一份『${d.name}』端给他]<br><span style="font-size:12px;opacity:0.8;color:var(--text-sub)">${d.recipe.replace(/\n/g,'<br>')}</span>`;
          appendChat('user', txt);
          let p = `我重新做了一份『${d.name}』给你，配方：\n${d.recipe}\n请你观察并吃一口，给出反应。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
          await callAI(p);
        }

        function renderMenu() {
          if(!savedMenu.length) { 
            root.querySelector('#menuGrid').innerHTML='<div class="sys-text" style="grid-column:1/-1">空空如也</div>'; 
            return; 
          }
          root.querySelector('#menuGrid').innerHTML = savedMenu.map((m,i)=>`
            <div class="menu-card">
              <div class="m-icon">🎂</div>
              <div class="m-name">${m.name}</div>
              <button class="m-re-btn" data-idx="${i}">重做送给他</button>
            </div>`).join('');

          root.querySelectorAll('.m-re-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const idx = parseInt(btn.getAttribute('data-idx'));
              serveOldCake(idx);
            });
          });
        }

        // 7. 衣橱换装系统
        function renderClosetPills(id, items, who, type) {
          root.querySelector('#' + id).innerHTML = items.map((t,i)=>`<div class="c-pill ${i===0?'active':''}" data-val="${t}">${t}</div>`).join('');
          if(items.length>0) look[who][type] = items[0];

          root.querySelectorAll(`#${id} .c-pill`).forEach(pill => {
            pill.addEventListener('click', () => {
              root.querySelectorAll(`#${id} .c-pill`).forEach(p=>p.classList.remove('active')); 
              pill.classList.add('active');
              const item = pill.getAttribute('data-val');
              look[who][type] = item;
              updateStatusBar();
              roche.ui.toast('换装成功！状态已更新');
            });
          });
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

        function formatLook(obj) {
          let arr = [];
          if(obj.clothes!=='无') arr.push(`<span class="st-pill">${obj.clothes}</span>`);
          if(obj.lingerie && obj.lingerie!=='无') arr.push(`<span class="st-pill nsfw">${obj.lingerie}</span>`);
          if(obj.hair!=='无') arr.push(`<span class="st-pill">${obj.hair}</span>`);
          if(obj.jewelry!=='无') arr.push(`<span class="st-pill">${obj.jewelry}</span>`);
          if(obj.special!=='无') arr.push(`<span class="st-pill">${obj.special}</span>`);
          if(obj.nsfw!=='无') arr.push(`<span class="st-pill nsfw">${obj.nsfw}</span>`);
          if(obj.toys!=='无') arr.push(`<span class="st-pill toy">${obj.toys}</span>`);
          return arr.length ? arr.join('') : '<span style="color:var(--text-sub);font-size:11px;font-style:italic;padding-left:4px;">全裸无挂件</span>';
        }

        function updateStatusBar() {
          root.querySelector('#st-his-detail').innerHTML = formatLook(look.his);
          root.querySelector('#st-my-detail').innerHTML = formatLook(look.my);
        }

        // 8. 互动 Play 玩法
        function renderPlays() { 
          root.querySelector('#playList').innerHTML = pick(DB.plays, 12).map((p,i)=>`<div class="play-btn-item" data-play="${p}">${i+1}. ${p}</div>`).join(''); 
          
          root.querySelectorAll('.play-btn-item').forEach(item => {
            item.addEventListener('click', () => {
              const playText = item.getAttribute('data-play');
              triggerPlay(playText);
            });
          });
        }

        function openPlayPanel() { renderPlays(); root.querySelector('#playModal').classList.add('show'); }

        function triggerPlay(playText) {
          if(isGenerating) return; 
          root.querySelector('#playModal').classList.remove('show');
          appendChat('user', `<span style="color:#f43f5e;font-weight:bold">【触发互动】</span> ${playText}`);
          let p = `【互动事件】：我正在对你做这件事——“${playText}”。\n请根据你的人设及我们当前的服装/玩具状态，给出激烈的色情反应。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
          callAI(p);
        }

        function triggerGachaPlay() {
          if(isGenerating) return; 
          root.querySelector('#playModal').classList.remove('show');
          let g = pick(DB.gacha, 1)[0];
          appendChat('user', `<span style="color:#a855f7;font-weight:bold">【盲盒事件】</span><br>${g}`);
          let p = `【突发事件】：“${g}”。\n请顺着这个情景继续往下发展。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
          callAI(p);
        }

        function triggerNsfwGachaPlay() {
          if(isGenerating) return; 
          root.querySelector('#playModal').classList.remove('show');
          let g = pick(DB.nsfw_gacha, 1)[0];
          appendChat('user', `<span style="color:#881337;font-weight:bold">【深渊盲盒事件】</span><br>${g}`);
          let p = `【极端突发事件】：“${g}”。\n请顺着这个极度色情恶俗的情景继续往下发展，描写必须露骨激烈且符合设定。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`;
          callAI(p);
        }

        // 9. 聊天与 AI 交互核心
        function appendChat(role, html) {
          let b = root.querySelector('#chatBox'); 
          b.insertAdjacentHTML('beforeend', `<div class="msg-wrap ${role}"><div class="msg-bubble">${html}</div></div>`); 
          b.scrollTop = b.scrollHeight;
        }

        async function sendChat() {
          if(isGenerating) return;
          let text = root.querySelector('#chatInput').value.trim(); 
          if(!text) return;
          root.querySelector('#chatInput').value = ''; 
          appendChat('user', text.replace(/\n/g,'<br>'));
          await callAI(`我对你说：“${text}”。\n【强制格式】：\n\n[动作神态描写]\n“台词”\n<STATUS>他：状态 | 你：状态</STATUS>`);
        }

        async function callAI(userPrompt) {
          isGenerating = true;
          
          let hTxt = [look.his.clothes, look.his.hair, look.his.jewelry, look.his.special, look.his.nsfw, look.his.toys].filter(x=>x!=='无').join(', ') || '全裸';
          let mTxt = [look.my.clothes, look.my.lingerie, look.my.hair, look.my.jewelry, look.my.special, look.my.nsfw, look.my.toys].filter(x=>x!=='无').join(', ') || '全裸';
          
          let sys = `你是DM，运行文字互动游戏。角色：【${charName}】（人设：${charPersona}）。用户固定名字为：【CHERRY】（用“你”或“CHERRY”称呼）。\n【核心生理设定 - 绝对不可违背】：\n1. 角色（他）是生理男性，拥有男性器官（肉棒）。绝对禁止出现他拥有女性器官或双性特征的描述。\n2. 用户（你/CHERRY）是生理女性，拥有女性器官（花穴/小穴/子宫等）。绝对禁止描述你拥有肉棒（除非当前装备了假阳具）。\n3. 所有性插入行为，默认必须是角色（他）用肉棒肏你（进入你的身体），绝对禁止反向操作。\n\n【当前初始状态】：他：${hTxt} | 你：${mTxt}。\n如果剧情中衣服被脱掉、玩具被改变，请在最后的<STATUS>标签中更新！\n【绝对规则】：使用第三人称“他”描述角色动作。禁止替用户说话或做动作。\n【强制输出四段式】(必须严格包含这4个部分，且<STATUS>用 | 分隔双方)：\n\n[他的动作和神态描写]\n“他说出的台词”\n<STATUS>他：xxx | 你：xxx</STATUS>`;

          let msgs = [{role:'system', content:sys}, {role:'user', content:userPrompt}];
          let box = root.querySelector('#chatBox');
          let wrap = document.createElement('div'); 
          wrap.className = 'msg-wrap ai'; 
          wrap.innerHTML = `<div class="msg-bubble loading-blink">...</div>`;
          box.appendChild(wrap); 
          box.scrollTop = box.scrollHeight;
          
          try {
            // 使用 Roche 官方的 roche.ai.chat 接口进行无限制对话
            const result = await roche.ai.chat({
              messages: msgs,
              temperature: 0.95
            });

            const full = result.text || '';
            
            // 解析 AI 返回的 <STATUS> 标签并动态更新顶部状态栏
            let sMatch = full.match(/<STATUS>([\s\S]*?)<\/STATUS>/);
            if(sMatch && sMatch[1]) {
              let parts = sMatch[1].split('|');
              if(parts.length >= 2) {
                let hStr = parts[0].replace('他：','').trim();
                let mStr = parts[1].replace('你：','').trim();
                
                root.querySelector('#st-his-detail').innerHTML = hStr.split(/[,，]/).map(s=>{
                  let c = 'st-pill';
                  if(s.includes('跳蛋')||s.includes('肛塞')||s.includes('环')||s.includes('玩具')) c += ' toy';
                  else if(s.includes('印')||s.includes('纹')||s.includes('痕')) c += ' nsfw';
                  return `<span class="${c}">${s.trim()}</span>`;
                }).join('');
                
                root.querySelector('#st-my-detail').innerHTML = mStr.split(/[,，]/).map(s=>{
                  let c = 'st-pill';
                  if(s.includes('跳蛋')||s.includes('肛塞')||s.includes('环')||s.includes('玩具')||s.includes('内衣')) c += ' nsfw';
                  else if(s.includes('印')||s.includes('纹')||s.includes('痕')) c += ' nsfw';
                  return `<span class="${c}">${s.trim()}</span>`;
                }).join('');
              }
            }
            
            let textPart = full.replace(/<STATUS>[\s\S]*?<\/STATUS>/, '').trim();
            let tMatch = textPart.match(/<THOUGHT>([\s\S]*?)(?:<\/THOUGHT>|$)/);
            textPart = textPart.replace(/<THOUGHT>[\s\S]*?(?:<\/THOUGHT>|$)/, '').trim();
            textPart = textPart.replace(/\[(.*?)\]/g, '<span class="action-text">[$1]</span>');
            
            let html = '';
            if(tMatch && tMatch[1]) html += `<div class="thought-box">${tMatch[1].trim()}</div>`;
            if(textPart) html += textPart.replace(/\n/g, '<br>');
            
            wrap.querySelector('.msg-bubble').innerHTML = html || '没有返回有效内容';
            wrap.querySelector('.msg-bubble').classList.remove('loading-blink');
            box.scrollTop = box.scrollHeight;
          } catch(e) { 
            wrap.querySelector('.msg-bubble').innerHTML = `<span style="color:red">出错啦: ${e.message}</span>`; 
            wrap.querySelector('.msg-bubble').classList.remove('loading-blink');
          }
          isGenerating = false;
        }

        // 10. 全局事件绑定与生命周期控制
        const globalClickHandler = (e) => {
          if (!e.target.closest('.theme-picker') && !e.target.closest('.theme-btn')) {
            root.querySelectorAll('.theme-picker').forEach(p => p.classList.remove('show'));
          }
          if (e.target.id === 'playModal') { 
            e.target.classList.remove('show'); 
          }
        };
        document.addEventListener('click', globalClickHandler);

        // 绑定退出按钮
        const exitHandler = () => {
          roche.ui.closeApp();
        };
        root.querySelector('#exit-btn-select').addEventListener('click', exitHandler);
        root.querySelector('#exit-btn-main').addEventListener('click', exitHandler);

        // 绑定调色盘按钮
        root.querySelector('#theme-btn-select').addEventListener('click', (e) => togglePicker(e, 'tp1'));
        root.querySelector('#theme-btn-main').addEventListener('click', (e) => togglePicker(e, 'tp2'));

        // 绑定主题切换
        root.querySelectorAll('.theme-dot').forEach(dot => {
          dot.addEventListener('click', () => {
            setTheme(dot.getAttribute('data-theme'));
          });
        });

        // 绑定盲盒主题
        root.querySelector('#gacha-btn-1').addEventListener('click', randomTheme);
        root.querySelector('#gacha-btn-2').addEventListener('click', randomTheme);
        root.querySelector('#nsfw-gacha-btn-1').addEventListener('click', randomNsfwTheme);
        root.querySelector('#nsfw-gacha-btn-2').addEventListener('click', randomNsfwTheme);

        // 底部导航切换
        root.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
          item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            switchTab(tab, item);
          });
        });

        // 各种动作按钮绑定
        root.querySelector('#refresh-cake-btn').addEventListener('click', refreshCake);
        root.querySelector('#make-cake-btn').addEventListener('click', makeCake);
        root.querySelector('#serve-cake-btn').addEventListener('click', serveCake);
        root.querySelector('#refresh-closet-btn').addEventListener('click', refreshCloset);
        root.querySelector('#play-panel-btn').addEventListener('click', openPlayPanel);
        root.querySelector('#chat-send-btn').addEventListener('click', sendChat);
        root.querySelector('#play-gacha-btn').addEventListener('click', triggerGachaPlay);
        root.querySelector('#play-gacha-nsfw-btn').addEventListener('click', triggerNsfwGachaPlay);

        // 回车发送消息
        root.querySelector('#chatInput').addEventListener('keydown', (e) => {
          if (e.key === 'Enter') sendChat();
        });

        // 11. 执行初始化
        init();

        // 12. 将清理函数挂载到容器上，供 unmount 调用
        container._cleanupBakeWorkshop = () => {
          document.removeEventListener('click', globalClickHandler);
        };
      },

      async unmount(container, roche) {
        // 执行清理，防止内存泄漏
        if (container._cleanupBakeWorkshop) {
          container._cleanupBakeWorkshop();
          delete container._cleanupBakeWorkshop;
        }
        // 清理 DOM
        container.replaceChildren();
        // 清理插入的样式
        const style = document.getElementById("roche-plugin-bake-style");
        if (style) style.remove();
      }
    }
  ]
});
