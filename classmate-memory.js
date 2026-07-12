// ============================================================
// 青春同学录 - Roche 插件 (顶栏彻底上移版 v1.0.5)
// 强制 padding-top: 0 !important，并添加红色测试边框
// ============================================================

(function() {
  window.RochePlugin.register({
    id: "classmate-memory",
    name: "青春同学录",
    version: "1.0.5",
    apps: [
      {
        id: "classmate-memory-home",
        name: "同学录",
        icon: "book",
        iconImage: "",
        async mount(container, roche) {
          container.innerHTML = `
            <div class="roche-plugin-classmate" style="height:100%;display:flex;flex-direction:column;position:relative;padding-top: env(safe-area-inset-top, 0px);padding-bottom: env(safe-area-inset-bottom, 0px);overflow-x:hidden;">
              <style>
                /* 全部样式限定在 .roche-plugin-classmate 内 */
                .roche-plugin-classmate * { box-sizing: border-box; margin:0; padding:0; }
                .roche-plugin-classmate { 
                  display:flex; flex-direction:column; height:100%; 
                  background: var(--bg, #f5f5f5); color: var(--text-main, #333);
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  position:relative;
                  overflow-x:hidden;
                }
                /* 6大主题 */
                .roche-plugin-classmate[data-theme="mint"] { --bg: #e0f2f1; --panel: #ffffff; --primary: #00897b; --primary-light: #b2dfdb; --text-main: #004d40; --text-sub: #00695c; --paper: #f4fbfb; --tape: rgba(178,223,219,0.5); }
                .roche-plugin-classmate[data-theme="sakura"] { --bg: #fce4ec; --panel: #ffffff; --primary: #e91e63; --primary-light: #f8bbd0; --text-main: #880e4f; --text-sub: #ad1457; --paper: #fff5f8; --tape: rgba(248,187,208,0.5); }
                .roche-plugin-classmate[data-theme="ocean"] { --bg: #e1f5fe; --panel: #ffffff; --primary: #039be5; --primary-light: #b3e5fc; --text-main: #01579b; --text-sub: #0277bd; --paper: #f0f9ff; --tape: rgba(179,229,252,0.5); }
                .roche-plugin-classmate[data-theme="autumn"] { --bg: #fff8e1; --panel: #ffffff; --primary: #ff8f00; --primary-light: #ffecb3; --text-main: #e65100; --text-sub: #ef6c00; --paper: #fffdf5; --tape: rgba(255,236,179,0.5); }
                .roche-plugin-classmate[data-theme="night"] { --bg: #1a1a2e; --panel: #232336; --primary: #e94560; --primary-light: #533440; --text-main: #eeeeee; --text-sub: #b5b5b5; --paper: #2a2a40; --tape: rgba(83,52,64,0.5); }
                .roche-plugin-classmate[data-theme="vintage"] { --bg: #d7ccc8; --panel: #f5f5f5; --primary: #5d4037; --primary-light: #bcaaa4; --text-main: #3e2723; --text-sub: #5d4037; --paper: #efebe9; --tape: rgba(188,170,164,0.5); }
                .roche-plugin-classmate .page { display:none; flex-direction:column; height:100%; }
                .roche-plugin-classmate .page.active { display:flex; animation:fadeIn 0.3s; }
                @keyframes fadeIn { from{opacity:0; transform:scale(0.98)} to{opacity:1; transform:scale(1)} }
                
                /* ===== 顶栏强制上移 ===== */
                .roche-plugin-classmate .header { 
                  padding: 0px 20px 10px 20px !important;   /* 上边距强制为0 */
                  background: var(--panel); 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  border-bottom: 2px solid var(--primary); 
                  flex-shrink: 0;
                  /* 临时红色边框，确认生效后删除 */
                  border-top: 3px solid red;
                }
                .roche-plugin-classmate .header-title { font-weight:bold; font-size:18px; color:var(--primary); }
                .roche-plugin-classmate .theme-btn { font-size:22px; cursor:pointer; padding:5px; background:var(--primary-light); border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; }
                .roche-plugin-classmate .theme-picker { position:absolute; top:50px; right:15px; background:var(--panel); border-radius:16px; padding:12px; display:none; grid-template-columns:repeat(3,1fr); gap:12px; box-shadow:0 8px 25px rgba(0,0,0,0.15); border:1px solid var(--primary-light); z-index:40; }
                .roche-plugin-classmate .theme-picker.show { display:grid; }
                .roche-plugin-classmate .theme-dot { width:30px; height:30px; border-radius:50%; cursor:pointer; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.2); }
                .roche-plugin-classmate .char-list { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:15px; }
                .roche-plugin-classmate .char-card { background:var(--panel); border:2px dashed var(--primary-light); border-radius:20px; padding:15px; display:flex; align-items:center; gap:15px; cursor:pointer; transition:0.2s; }
                .roche-plugin-classmate .char-card:active { background:var(--primary-light); transform:translateY(2px); }
                .roche-plugin-classmate .char-av { width:56px; height:56px; border-radius:50%; background-size:cover; background-position:center; border:3px solid var(--primary); flex-shrink:0; }
                .roche-plugin-classmate .char-name { font-weight:bold; font-size:16px; flex:1; }
                .roche-plugin-classmate .main-view { flex:1; position:relative; overflow:hidden; }
                .roche-plugin-classmate .tab-page { position:absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; overflow-y:auto; overflow-x:hidden; }
                .roche-plugin-classmate .tab-page.active { display:flex; }
                .roche-plugin-classmate .bottom-nav { display:flex; background:var(--panel); border-top:1px solid var(--primary-light); padding:10px 5px 15px; flex-shrink:0; }
                .roche-plugin-classmate .nav-item { flex:1; text-align:center; font-size:12px; color:var(--text-sub); display:flex; flex-direction:column; gap:4px; cursor:pointer; font-weight:bold; transition:0.3s; }
                .roche-plugin-classmate .nav-item.active { color:var(--primary); transform:translateY(-3px); }
                .roche-plugin-classmate .nav-icon { font-size:22px; }
                .roche-plugin-classmate .book-top-bar { padding:15px 20px 0; display:flex; justify-content:center; }
                .roche-plugin-classmate .cute-switch-btn { background:linear-gradient(135deg, var(--primary), var(--primary-light)); color:#fff; border:none; padding:10px 20px; border-radius:24px; font-size:14px; font-weight:bold; cursor:pointer; }
                .roche-plugin-classmate .book-area { padding:15px 20px 25px; flex:1; display:flex; justify-content:center; }
                .roche-plugin-classmate .binder { width:100%; max-width:600px; background:var(--paper); border-radius:12px 24px 24px 12px; box-shadow:inset 30px 0 40px rgba(0,0,0,0.04), 5px 10px 20px rgba(0,0,0,0.08); position:relative; padding:30px 20px 30px 45px; border:1px solid var(--primary-light); border-left:none; background-image: radial-gradient(var(--primary-light) 1px, transparent 1px); background-size:20px 20px; }
                .roche-plugin-classmate .binder::before { content:''; position:absolute; top:0; left:12px; bottom:0; width:24px; background:radial-gradient(circle at 12px 20px, var(--bg) 6px, transparent 7px) repeat-y; background-size:100% 40px; border-right:2px solid rgba(0,0,0,0.05); z-index:2; }
                .roche-plugin-classmate .book-title-wrap { text-align:center; margin-bottom:25px; }
                .roche-plugin-classmate .book-title { display:inline-block; font-size:20px; font-weight:bold; color:var(--primary); background:var(--panel); padding:8px 20px; border-radius:12px; border:2px dashed var(--primary-light); transform:rotate(-1deg); }
                .roche-plugin-classmate .q-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px 15px; }
                .roche-plugin-classmate .q-item { background:rgba(255,255,255,0.6); border:1px solid var(--primary-light); border-radius:12px; padding:12px; position:relative; display:flex; flex-direction:column; }
                .roche-plugin-classmate .q-item.full-width { grid-column:1/-1; }
                .roche-plugin-classmate .q-item:nth-child(even)::after { content:''; position:absolute; top:-6px; right:10px; width:35px; height:12px; background:var(--tape); transform:rotate(3deg); box-shadow:0 1px 2px rgba(0,0,0,0.05); }
                .roche-plugin-classmate .q-label { font-size:12px; font-weight:bold; color:var(--text-sub); display:flex; align-items:center; gap:6px; margin-bottom:6px; }
                .roche-plugin-classmate .q-num { background:var(--primary-light); color:var(--primary); width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
                .roche-plugin-classmate .q-ans { font-family:'Courier New', Courier, monospace; font-size:14px; font-weight:bold; color:var(--primary); border-bottom:2px dotted var(--primary-light); min-height:22px; line-height:1.4; padding-left:5px; word-break:break-all; }
                .roche-plugin-classmate .action-bar { padding:15px 20px; display:flex; flex-direction:column; gap:12px; background:var(--panel); border-top:1px solid var(--primary-light); }
                .roche-plugin-classmate .btn { background:var(--primary); color:#fff; border:none; padding:15px; border-radius:16px; font-size:16px; font-weight:bold; cursor:pointer; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.1); transition:0.2s; }
                .roche-plugin-classmate .btn:active { transform:scale(0.98); }
                .roche-plugin-classmate .btn-outline { background:var(--panel); border:2px solid var(--primary); color:var(--primary); box-shadow:none; }
                .roche-plugin-classmate .btn-row { display:flex; gap:10px; }
                .roche-plugin-classmate .btn-row .btn { flex:1; font-size:14px; padding:12px; }

                /* ===== 聊天区域（已修复） ===== */
                .roche-plugin-classmate .chat-history {
                  flex:1;
                  overflow-y:auto;
                  overflow-x:hidden;
                  padding:20px 15px;
                  display:flex;
                  flex-direction:column;
                  gap:18px;
                  width:100%;
                }
                .roche-plugin-classmate .msg-wrap {
                  display:flex;
                  flex-direction:column;
                  max-width:90%;
                  word-break:break-word;
                }
                .roche-plugin-classmate .msg-wrap.user { align-self:flex-end; align-items:flex-end; }
                .roche-plugin-classmate .msg-wrap.ai { align-self:flex-start; align-items:flex-start; }
                .roche-plugin-classmate .msg-bubble {
                  padding:14px 18px;
                  border-radius:20px;
                  font-size:15px;
                  line-height:1.6;
                  word-wrap:break-word;
                  max-width:100%;
                  box-shadow:0 4px 10px rgba(0,0,0,0.06);
                }
                .roche-plugin-classmate .user .msg-bubble {
                  background:linear-gradient(135deg, var(--primary), var(--primary-light));
                  color:#111;
                  border-bottom-right-radius:4px;
                  font-weight:500;
                }
                .roche-plugin-classmate .ai .msg-bubble {
                  background:var(--panel);
                  border:1px solid var(--primary-light);
                  border-bottom-left-radius:4px;
                  color:var(--text-main);
                }
                .roche-plugin-classmate .thought-box {
                  margin-bottom:8px;
                  font-size:13px;
                  color:var(--text-sub);
                  font-style:italic;
                  background:var(--paper);
                  padding:10px 15px;
                  border-radius:16px;
                  border:1px dashed var(--primary-light);
                  border-left:4px solid var(--primary);
                  width:100%;
                  word-break:break-word;
                }

                .roche-plugin-classmate .chat-input-bar {
                  background:var(--panel);
                  padding: 14px 20px 14px 20px;
                  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
                  border-top:1px solid var(--primary-light);
                  display:flex;
                  gap: 16px;
                  align-items:center;
                  flex-shrink:0;
                  width:100%;
                }
                .roche-plugin-classmate .chat-input {
                  flex:1;
                  background:var(--bg);
                  border:1px solid var(--primary-light);
                  padding:14px 20px;
                  border-radius:24px;
                  font-size:15px;
                  outline:none;
                  color:var(--text-main);
                  transition:0.2s;
                  min-width:0;
                }
                .roche-plugin-classmate .chat-input:focus {
                  border-color:var(--primary);
                  background:var(--panel);
                  box-shadow:0 0 0 3px var(--primary-light);
                }
                .roche-plugin-classmate .chat-send {
                  background:var(--primary-light);
                  border: none;
                  color: var(--primary);
                  width: 52px;
                  height: 52px;
                  border-radius:50%;
                  font-size:24px;
                  cursor:pointer;
                  flex-shrink:0;
                  transition:0.2s;
                  box-shadow:0 2px 8px rgba(0,0,0,0.05);
                  display:flex;
                  align-items:center;
                  justify-content:center;
                }
                .roche-plugin-classmate .chat-send:active {
                  transform:scale(0.92);
                  background:var(--primary);
                  color:#fff;
                }

                .roche-plugin-classmate .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(3px); z-index:100; display:none; align-items:center; justify-content:center; }
                .roche-plugin-classmate .modal-overlay.show { display:flex; }
                .roche-plugin-classmate .tpl-modal { background:var(--panel); width:90%; max-width:380px; border-radius:24px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2); border:2px solid var(--primary-light); display:flex; flex-direction:column; gap:10px; max-height:80vh; overflow-y:auto; }
                .roche-plugin-classmate .tpl-modal-title { text-align:center; font-weight:bold; color:var(--primary); font-size:16px; margin-bottom:10px; }
                .roche-plugin-classmate .tpl-card { background:var(--bg); border:1px solid var(--primary-light); padding:12px 15px; border-radius:16px; font-size:14px; font-weight:bold; color:var(--text-main); cursor:pointer; text-align:center; transition:0.2s; }
                .roche-plugin-classmate .tpl-card:active { transform:scale(0.95); background:var(--primary-light); }
                .roche-plugin-classmate .tpl-card.gacha { background:linear-gradient(135deg, #fde047, var(--primary)); color:#fff; border:none; }
                .roche-plugin-classmate .sys-text { text-align:center; font-size:12px; color:var(--text-sub); margin:10px 0; background:var(--primary-light); padding:6px 15px; border-radius:20px; align-self:center; }
                .roche-plugin-classmate .loading-blink { animation:blink 1.5s infinite; opacity:0.6; }
                @keyframes blink { 50% { opacity:0.2; } }
                .roche-plugin-classmate .back-btn {
                  position:absolute;
                  top: calc(env(safe-area-inset-top, 0px) + 0px);  /* 跟着顶栏上移 */
                  left: 15px;
                  background:var(--panel);
                  border:1px solid var(--primary-light);
                  border-radius:50%;
                  width:40px;
                  height:40px;
                  font-size:20px;
                  cursor:pointer;
                  z-index:50;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  box-shadow:0 2px 8px rgba(0,0,0,0.1);
                }
                .roche-plugin-classmate .loading-text { text-align:center; padding:40px 20px; color:var(--text-sub); }
              </style>

              <!-- 返回按钮 -->
              <button class="back-btn" id="classmate-close-btn">✕</button>

              <!-- 选人页 -->
              <div class="page active" id="classmate-page-select">
                <div class="header" style="padding-left:70px;">
                  <div class="header-title">📖 选择他的同学录</div>
                  <div class="theme-btn" onclick="window._classmateToggleThemePicker('themePicker1')">🎨</div>
                </div>
                <div class="theme-picker" id="themePicker1">
                  <div class="theme-dot" style="background:#00897b" onclick="window._classmateSetTheme('mint')"></div>
                  <div class="theme-dot" style="background:#e91e63" onclick="window._classmateSetTheme('sakura')"></div>
                  <div class="theme-dot" style="background:#039be5" onclick="window._classmateSetTheme('ocean')"></div>
                  <div class="theme-dot" style="background:#ff8f00" onclick="window._classmateSetTheme('autumn')"></div>
                  <div class="theme-dot" style="background:#e94560" onclick="window._classmateSetTheme('night')"></div>
                  <div class="theme-dot" style="background:#8d6e63" onclick="window._classmateSetTheme('vintage')"></div>
                </div>
                <div class="char-list" id="classmate-charList">
                  <div class="loading-text">⏳ 加载角色中...</div>
                </div>
              </div>

              <!-- 主页面 -->
              <div class="page" id="classmate-page-main">
                <div class="header" style="padding-left:70px;">
                  <div class="header-title" id="classmate-roomTitle">他的同学录</div>
                  <div class="theme-btn" onclick="window._classmateToggleThemePicker('themePicker2')">🎨</div>
                </div>
                <div class="theme-picker" id="themePicker2">
                  <div class="theme-dot" style="background:#00897b" onclick="window._classmateSetTheme('mint')"></div>
                  <div class="theme-dot" style="background:#e91e63" onclick="window._classmateSetTheme('sakura')"></div>
                  <div class="theme-dot" style="background:#039be5" onclick="window._classmateSetTheme('ocean')"></div>
                  <div class="theme-dot" style="background:#ff8f00" onclick="window._classmateSetTheme('autumn')"></div>
                  <div class="theme-dot" style="background:#e94560" onclick="window._classmateSetTheme('night')"></div>
                  <div class="theme-dot" style="background:#8d6e63" onclick="window._classmateSetTheme('vintage')"></div>
                </div>
                <div class="main-view">
                  <!-- 同学录 Tab -->
                  <div class="tab-page active" id="classmate-tab-book">
                    <div class="book-top-bar">
                      <button class="cute-switch-btn" onclick="window._classmateOpenTplModal()">🎀 挑选同学录模板 🎀</button>
                    </div>
                    <div class="book-area">
                      <div class="binder">
                        <div class="book-title-wrap"><div class="book-title" id="classmate-bookTitle">模板名称</div></div>
                        <div class="q-grid" id="classmate-qGrid"></div>
                      </div>
                    </div>
                    <div class="action-bar" id="classmate-actionBar">
                      <button class="btn" onclick="window._classmateInviteFill()">将笔递给他，让他填写 ✏️</button>
                    </div>
                  </div>
                  <!-- 闲聊 Tab -->
                  <div class="tab-page" id="classmate-tab-chat">
                    <div class="chat-history" id="classmate-chatBox">
                      <div class="sys-text">这是你们的课桌角。你可以把写好的同学录发给他看。</div>
                    </div>
                    <div class="chat-input-bar">
                      <input type="text" class="chat-input" id="classmate-chatInput" placeholder="传小纸条...">
                      <button class="chat-send" onclick="window._classmateSendChat()">➤</button>
                    </div>
                  </div>
                </div>
                <div class="bottom-nav">
                  <div class="nav-item active" onclick="window._classmateSwitchTab('book')"><div class="nav-icon">📖</div>手账</div>
                  <div class="nav-item" onclick="window._classmateSwitchTab('chat')"><div class="nav-icon">💬</div>纸条</div>
                </div>
              </div>

              <!-- 模板选择弹窗 -->
              <div class="modal-overlay" id="classmate-tplModal">
                <div class="tpl-modal">
                  <div class="tpl-modal-title">✨ 选择一个模板 ✨</div>
                  <div id="classmate-modalList"></div>
                  <button class="tpl-card" style="margin-top:10px;background:var(--bg)" onclick="window._classmateCloseTplModal()">取消</button>
                </div>
              </div>
            </div>
          `;

          // ---------- JavaScript 逻辑（与之前一致，未改动） ----------
          window._classmateRoche = roche;
          const appContainer = container.querySelector('.roche-plugin-classmate');

          let contacts = [];
          let targetId = null;
          let charName = '';
          let charPersona = '';
          let myName = '你';
          let isGenerating = false;
          let currentTpl = null;
          let currentAnswers = [];

          const fixedTemplates = [
            { n: '📋 经典档案录', q: ['姓名','专属昵称','性别/属性','破壳日','星座','血型','最大的爱好','不为人知的特长','最常说的口头禅','最喜欢的颜色','最爱吃的食物','绝对不碰的食物','最喜欢的季节','最崇拜的人','目前的口头禅','最怕的东西','最大的梦想','对我的第一印象','现在对我的感觉','给我的一句话留言'] },
            { n: '💖 青春悸动篇', q: ['第一次心动时刻','最喜欢我身体哪部分','觉得我什么时候最可爱','我做过最让你生气的事','最舍不得我的一点','想带我见家长吗','未来家里养几只宠物','理想中的婚礼地点','家务打算怎么分','谁掌管财政大权','周末最想和我干嘛','吵架了谁先低头','最喜欢亲吻我哪里','喜欢抱抱还是亲亲','最想收到我什么礼物','最想给我制造的惊喜','给我起的专属外号','我不在身边时在想啥','睡前最想听我说什么','会永远爱我吗'] },
            { n: '🧠 奇葩脑洞篇', q: ['如果我变成史莱姆','丧尸爆发必带三样东西','最想拥有的超能力','中了一千万第一件事','给我起个中二代号','如果咱俩灵魂互换','去荒岛只能带一个人','如果我秃顶了','外星人抓我你咋办','如果我是一只猫','最想穿越到哪个朝代','如果能隐身一天干嘛','如果我会读心术','咱俩谁能在宫斗活到最后','如果我是个渣女/男','最想看我穿什么奇装异服','如果我失忆了','如果明天是世界末日','你想把谁发射到火星','写一句最中二的遗言'] },
            { n: '🔍 灵魂拷问卷', q: ['瞒着我最大的秘密','做过最蠢的一件事','最让你后悔的决定','有没有精神出轨过','最受不了我哪个缺点','你觉得咱俩性格合吗','有没有偷看我手机','最怕我问你什么问题','觉得我配得上你吗','有没有想过分手','最虚伪的一面是什么','有没有在心里比较过我','你觉得婚姻是坟墓吗','最自私的一个想法','最想删掉的一段记忆','最怕失去什么','你是个好人吗','有没有骗过我','如果我背叛你咋办','说一句最狠的真心话'] },
            { n: '🚀 时光慢递信', q: ['十年后的你在干嘛','十年后的我在干嘛','十年后我们还在一起吗','十年后我们的存款','给未来我的一句忠告','最想和我去完成的清单1','最想和我去完成的清单2','最想和我去完成的清单3','你觉得我们会变老吗','老了以后谁先走','如果你先走遗言是啥','如果我先走你咋办','现在最想对我说的话','现在最想做的事','你觉得人生的意义是','记录下此刻的心情','记录下今天的天气','记录下旁边的人','给这个世界留句话','签下你的大名'] },
            { n: '🌙 熄灯后的秘密', q: ['最敏感的部位','最喜欢的姿势','对我产生过非分之想吗','喜欢开灯还是关灯','最受不了我发出什么声音','喜欢温柔还是粗暴','想尝试的野外地点','对道具的接受度','我的哪个部位最诱惑你','多久解决一次生理需求','有没有幻想过我','喜欢咬痕还是吻痕','事后喜欢怎样被安抚','洗澡时会想我吗','最喜欢我穿什么颜色的内衣','喜欢被我支配还是支配我','最想和我解锁的成就','对角色扮演的看法','如果我主动诱惑你','用一个词形容你的欲望'] },
            { n: '⚔️ 生死搭档鉴定', q: ['丧尸爆发第一反应','唯一的武器选什么','最后一块面包给谁','如果我被咬了你怎么办','藏身处选超市还是地堡','队伍里谁当队长','遇到其他幸存者救不救','如果我拖后腿了','最怕遇到哪种变异体','末日里最想念的美食','没有网的夜晚怎么过','谁负责守夜','如果走散了去哪汇合','物资只够一个人活七天','找到抗体但只能救一人','为了生存能放弃底线吗','末日来临前的最后一通电话','如果世界只剩我们俩','绝境中会对彼此撒谎吗','刻在墓碑上的墓志铭'] }
          ];
          const gachaPool = ['最喜欢的电影','最爱听的歌','去过最远的地方','最喜欢的运动','最讨厌的天气','最想见的人','如果能回到过去','你相信外星人吗','如果能长生不老','你最骄傲的事','你最自卑的事','你最想忘记的人','你觉得世界公平吗','你相信命运吗','你最喜欢的数字','你最喜欢的动物','如果能变成一种植物','你最想学的一门语言','你最想掌握的乐器','如果不用工作你想干嘛','最喜欢我穿什么衣服','最喜欢我什么发型','最受不了我撒娇吗','我哭的时候你咋办','我生病的时候你咋办','最想吃我做的什么菜','最想和我一起看日出吗','最想和我一起看雪吗','最想和我一起淋雨吗','最想和我一起发呆吗','你会给我写情书吗','你会给我唱歌吗','你会给我弹琴吗','你会给我画画吗','你会一直牵着我吗','你会背我吗','你会公主抱我吗','你会摸头杀吗','你会壁咚我吗','流落荒岛','被困电梯','中了彩票','穿越到古代','变成超人','变成吸血鬼','变成妖怪','变成神仙','最后一天','如果是梦','如果世界是游戏'];

          function getAvatar(id) { return `https://picsum.photos/seed/${id}/100/100`; }

          async function loadCharacters() {
            try {
              const chars = await roche.character.list();
              if (chars && chars.length) {
                contacts = chars.map(c => ({
                  id: c.id,
                  name: c.handle || c.name || '未命名',
                  persona: c.persona || c.bio || '',
                  avatar: c.avatar || getAvatar(c.id)
                }));
              } else {
                contacts = [
                  { id: 'demo1', name: '林小夕', persona: '温柔文艺，喜欢写诗和弹吉他', avatar: getAvatar('demo1') },
                  { id: 'demo2', name: '陆子轩', persona: '阳光运动型，篮球校队', avatar: getAvatar('demo2') },
                  { id: 'demo3', name: '夏晚晴', persona: '古灵精怪，二次元少女', avatar: getAvatar('demo3') },
                ];
              }
            } catch (e) {
              console.warn('读取角色失败，使用示例角色', e);
              contacts = [
                { id: 'demo1', name: '林小夕', persona: '温柔文艺，喜欢写诗和弹吉他', avatar: getAvatar('demo1') },
                { id: 'demo2', name: '陆子轩', persona: '阳光运动型，篮球校队', avatar: getAvatar('demo2') },
              ];
            }
            renderCharList();
          }

          function renderCharList() {
            const listEl = document.getElementById('classmate-charList');
            if (!contacts.length) {
              listEl.innerHTML = `<div class="loading-text">暂无角色，请先在 Roche 中添加角色</div>`;
              return;
            }
            listEl.innerHTML = contacts.map(c => `
              <div class="char-card" onclick="window._classmateSelectChar('${c.id}')">
                <div class="char-av" style="background-image:url('${c.avatar}')"></div>
                <div class="char-name">${c.name}</div>
              </div>
            `).join('');
          }

          window._classmateSelectChar = async function(id) {
            targetId = id;
            const detail = contacts.find(c => c.id === id);
            if (!detail) return;
            charName = detail.name;
            charPersona = detail.persona || '';
            try {
              const full = await roche.character.get(id);
              if (full) {
                charPersona = full.persona || full.bio || charPersona;
                myName = full.handle || '你';
              }
            } catch(e) {}
            document.getElementById('classmate-roomTitle').innerText = `${charName} 的同学录`;
            document.getElementById('classmate-page-select').classList.remove('active');
            document.getElementById('classmate-page-main').classList.add('active');
            window._classmateChooseTpl(0, false);
          };

          window._classmateToggleThemePicker = function(id) {
            document.querySelectorAll('.roche-plugin-classmate .theme-picker').forEach(p => {
              if (p.id !== id) p.classList.remove('show');
            });
            document.getElementById(id).classList.toggle('show');
          };
          window._classmateSetTheme = function(theme) {
            appContainer.setAttribute('data-theme', theme);
            document.querySelectorAll('.roche-plugin-classmate .theme-picker').forEach(p => p.classList.remove('show'));
            roche.storage.set('classmate-theme', theme);
          };
          (async function() {
            try {
              const saved = await roche.storage.get('classmate-theme');
              if (saved) appContainer.setAttribute('data-theme', saved);
            } catch(e) {}
          })();

          window._classmateOpenTplModal = function() {
            document.getElementById('classmate-tplModal').classList.add('show');
          };
          window._classmateCloseTplModal = function() {
            document.getElementById('classmate-tplModal').classList.remove('show');
          };
          function buildModalList() {
            let html = fixedTemplates.map((t, i) => `<div class="tpl-card" onclick="window._classmateChooseTpl(${i}, false)">${t.n}</div>`).join('');
            html += `<div class="tpl-card gacha" onclick="window._classmateChooseTpl(0, true)">🎲 扭蛋盲盒卷 (随机)</div>`;
            document.getElementById('classmate-modalList').innerHTML = html;
          }
          buildModalList();

          window._classmateChooseTpl = function(idx, isGacha) {
            if (isGenerating) { window._classmateCloseTplModal(); roche.ui.toast('正在填写中！'); return; }
            if (isGacha) {
              let shuffled = [...gachaPool].sort(() => 0.5 - Math.random());
              currentTpl = { n: '🎲 神秘扭蛋盲盒卷', q: shuffled.slice(0, 20) };
            } else {
              currentTpl = fixedTemplates[idx];
            }
            window._classmateCloseTplModal();
            renderBook();
          };

          function renderBook() {
            document.getElementById('classmate-bookTitle').innerText = currentTpl.n;
            currentAnswers = new Array(20).fill('');
            let html = currentTpl.q.map((q, i) => {
              let fullWidth = (i >= 18) ? 'full-width' : '';
              return `<div class="q-item ${fullWidth}"><div class="q-label"><span class="q-num">${i+1}</span> ${q}</div><div class="q-ans" id="classmate-ans-${i}"></div></div>`;
            }).join('');
            document.getElementById('classmate-qGrid').innerHTML = html;
            document.getElementById('classmate-actionBar').innerHTML = `<button class="btn" onclick="window._classmateInviteFill()">将笔递给他，让他填写 ✏️</button>`;
          }

          window._classmateInviteFill = async function() {
            if (isGenerating) return;
            isGenerating = true;
            for (let i=0; i<20; i++) {
              let el = document.getElementById(`classmate-ans-${i}`);
              if (el) el.innerHTML = '<span class="loading-blink">...</span>';
            }
            document.getElementById('classmate-actionBar').innerHTML = `<button class="btn btn-outline" disabled>笔尖沙沙作响，正在认真填写...</button>`;

            const sysPrompt = `你正在扮演【${charName}】，人设：${charPersona}。用户是【${myName}】，你必须用“你”来称呼用户。
现在你正在填写用户递给你的名为“${currentTpl.n}”的手账本。
必须回答20个问题。答案要简短生动，符合你的性格。
【绝对强制规则】：只输出答案！不要输出题目！必须给出20个答案，每个答案之间必须用 ||| 分隔。
格式：答案1 ||| 答案2 ||| 答案3 ...`;
            const userPrompt = `请按顺序回答这20个问题：\n` + currentTpl.q.map((q,i)=>`${i+1}. ${q}`).join('\n');

            try {
              const result = await roche.ai.chat({
                messages: [
                  { role: 'system', content: sysPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
              });
              const full = result.text || '';
              const parts = full.split('|||');
              parts.forEach((part, i) => {
                if (i < 20) {
                  let el = document.getElementById(`classmate-ans-${i}`);
                  if (el) {
                    const ans = part.trim().replace(/\n/g, '');
                    el.innerHTML = ans || '<span style="color:var(--text-sub)">（未填写）</span>';
                    currentAnswers[i] = ans;
                  }
                }
              });
            } catch (e) {
              roche.ui.toast('AI 生成失败：' + e.message);
              for (let i=0; i<20; i++) {
                let el = document.getElementById(`classmate-ans-${i}`);
                if (el) el.innerHTML = '（生成失败）';
              }
            }

            isGenerating = false;
            document.getElementById('classmate-actionBar').innerHTML = `
              <div class="btn-row">
                <button class="btn btn-outline" onclick="window._classmateInviteFill()">🔄 擦掉重写</button>
                <button class="btn" onclick="window._classmateSendToChat()">将同学录发送给他 💬</button>
                <button class="btn" onclick="window._classmateSaveToMemory()">💾 存入记忆</button>
              </div>
            `;
          };

          window._classmateSendToChat = function() {
            window._classmateSwitchTab('chat');
            let summary = `[已发送他刚刚填写的《${currentTpl.n}》]<br><br>`;
            for (let i=0; i<Math.min(2, 20); i++) {
              if (currentAnswers[i]) {
                summary += `<span style="font-size:11px;opacity:0.8;color:var(--text-sub)">Q: ${currentTpl.q[i]}</span><br><b>${currentAnswers[i]}</b><br><br>`;
              }
            }
            appendChat('user', summary);
            const prompt = `用户把刚才你填好的《${currentTpl.n}》发给了你。请你根据自己填写的答案或你的人设，自然地作出反应。\n【强制规则】：\n1. 必须用“你”称呼用户。\n2. 绝对不可代替用户说话或做动作。\n3. 必须先输出你的真实心声（含<THOUGHT>标签），再输出你发给用户的消息。`;
            callChatAI(prompt);
          };

          window._classmateSaveToMemory = async function() {
            if (!targetId) return;
            let memoryText = `《${currentTpl.n}》同学录记录：\n`;
            for (let i=0; i<20; i++) {
              if (currentAnswers[i]) {
                memoryText += `Q: ${currentTpl.q[i]}\nA: ${currentAnswers[i]}\n`;
              }
            }
            try {
              const char = await roche.character.get(targetId);
              const conversationId = char.conversationId || targetId;
              await roche.memory.write({
                conversationId: conversationId,
                summaryText: `同学录记录 (${currentTpl.n})`,
                action: memoryText,
                who: [charName],
                when: new Date().toLocaleString(),
                where: '同学录插件',
                source: 'classmate-memory'
              });
              roche.ui.toast('已保存到角色记忆 ✅');
            } catch (e) {
              roche.ui.toast('保存失败：' + e.message);
            }
          };

          function appendChat(role, htmlContent) {
            let box = document.getElementById('classmate-chatBox');
            box.insertAdjacentHTML('beforeend', `<div class="msg-wrap ${role}"><div class="msg-bubble">${htmlContent}</div></div>`);
            box.scrollTop = box.scrollHeight;
          }

          window._classmateSendChat = async function() {
            if (isGenerating) return;
            let input = document.getElementById('classmate-chatInput');
            let text = input.value.trim();
            if (!text) return;
            input.value = '';
            appendChat('user', text.replace(/\n/g,'<br>'));
            const prompt = `用户对你说：“${text}”。\n【强制规则】：\n1. 必须用“你”称呼用户。\n2. 绝对不可代替用户说话或做动作。\n3. 先输出你的真实心声（含<THOUGHT>标签），再输出你发给用户的消息。`;
            await callChatAI(prompt);
          };

          async function callChatAI(userPrompt) {
            isGenerating = true;
            const sysPrompt = `你正在扮演【${charName}】，人设：${charPersona}。用户是【${myName}】，你必须用“你”来称呼用户。你们正在传小纸条闲聊。\n【严禁越权】：绝对禁止描写用户的动作、表情或替用户说话。\n【强制格式】：必须包含 <THOUGHT>标签来表达你的内心想法！`;
            let box = document.getElementById('classmate-chatBox');
            let bubbleWrap = document.createElement('div');
            bubbleWrap.className = 'msg-wrap ai';
            bubbleWrap.innerHTML = `<div class="msg-bubble loading-blink">...</div>`;
            box.appendChild(bubbleWrap);
            box.scrollTop = box.scrollHeight;

            try {
              const result = await roche.ai.chat({
                messages: [
                  { role: 'system', content: sysPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
              });
              let full = result.text || '';
              let tMatch = full.match(/<THOUGHT>([\s\S]*?)(?:<\/THOUGHT>|$)/);
              let textPart = full.replace(/<THOUGHT>[\s\S]*?(?:<\/THOUGHT>|$)/, '').trim();
              let finalHtml = '';
              if (tMatch && tMatch[1]) finalHtml += `<div class="thought-box">💭 ${tMatch[1].trim()}</div>`;
              if (textPart) finalHtml += textPart.replace(/\n/g, '<br>');
              bubbleWrap.querySelector('.msg-bubble').innerHTML = finalHtml || '（沉默）';
              bubbleWrap.querySelector('.msg-bubble').classList.remove('loading-blink');
            } catch (e) {
              bubbleWrap.querySelector('.msg-bubble').innerHTML = `<span style="color:red">出错了: ${e.message}</span>`;
            }
            isGenerating = false;
          }

          window._classmateSwitchTab = function(tab) {
            document.querySelectorAll('.roche-plugin-classmate .tab-page, .roche-plugin-classmate .nav-item').forEach(el => el.classList.remove('active'));
            document.getElementById('classmate-tab-'+tab).classList.add('active');
            document.querySelectorAll('.roche-plugin-classmate .nav-item').forEach(item => {
              if (item.textContent.includes(tab==='book'?'手账':'纸条')) item.classList.add('active');
            });
          };

          document.getElementById('classmate-close-btn').addEventListener('click', () => {
            roche.ui.closeApp();
          });

          await loadCharacters();
        },
        async unmount(container, roche) {
          container.replaceChildren();
          ['_classmateRoche','_classmateSelectChar','_classmateToggleThemePicker','_classmateSetTheme','_classmateOpenTplModal','_classmateCloseTplModal','_classmateChooseTpl','_classmateInviteFill','_classmateSendToChat','_classmateSaveToMemory','_classmateSendChat','_classmateSwitchTab'].forEach(key => {
            delete window[key];
          });
        }
      }
    ]
  });
})();
