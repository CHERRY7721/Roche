(function () {
  "use strict";

  // ---------- 把整个 HTML 内容放在这里 ----------
  const HTML_CONTENT = `（此处粘贴您提供的 JSON 中的 htmlContent 字段内容，即从 <!DOCTYPE html> 到 </html> 的完整字符串）`;

  window.RochePlugin.register({
    id: "youth-classmate-book",
    name: "青春同学录",
    version: "1.0.0",
    apps: [
      {
        id: "classmate-app",
        name: "青春同学录",
        icon: "🧩",
        iconImage: "",

        async mount(container, roche) {
          // 1. 创建一个容器 div
          const appDiv = document.createElement("div");
          appDiv.style.width = "100%";
          appDiv.style.height = "100%";
          appDiv.style.overflow = "hidden";
          container.appendChild(appDiv);

          // 2. 注入 HTML
          appDiv.innerHTML = HTML_CONTENT;

          // 3. 适配 MIBU 对象 —— 将原本的 MIBU 替换为 Roche API
          //    您需要根据实际可用 API 调整下面的映射
          window.MIBU = {
            // 获取联系人列表（这里用会话列表模拟，可能不准确）
            getContacts: async function () {
              try {
                const convs = await roche.conversation.list();
                // 将每个会话包装成联系人格式
                return convs.map(c => ({
                  id: c.id,
                  name: c.name || c.title || c.handle || "未命名",
                  avatar: c.avatar || "",
                  // 如果需要有 persona，可以从 memory 读取或默认
                  persona: "一个有趣的人",
                  myName: "我"  // 可根据需要设置
                }));
              } catch (e) {
                console.error("获取联系人失败", e);
                return [];
              }
            },

            // 获取联系人详情（用会话信息填充）
            getContact: async function (id) {
              try {
                const conv = await roche.conversation.get(id);
                return {
                  id: conv.id,
                  name: conv.name || conv.title || conv.handle || "未命名",
                  avatar: conv.avatar || "",
                  persona: "一个有趣的人",
                  myName: "我"
                };
              } catch (e) {
                console.error("获取联系人详情失败", e);
                throw e;
              }
            },

            // 流式调用 AI（这里需要您自己实现 AI 调用）
            // 由于 Roche 没有直接提供 AI 生成 API，您需要自行接入（如调用外部大模型）
            // 这里给出一个示例占位，实际使用时请替换为真实请求
            callAIStream: async function (messages, onChunk) {
              // 示例：直接返回一个固定回答（您可替换为真实 HTTP 请求）
              const fakeReply = "（这是模拟回答，请配置真实的 AI 接口）";
              // 模拟流式输出
              for (let i = 0; i < fakeReply.length; i++) {
                onChunk(fakeReply[i], fakeReply.substring(0, i + 1));
                await new Promise(r => setTimeout(r, 30));
              }
              // 如果您有可用的 AI 接口，请参考以下伪代码：
              /*
              const response = await fetch("您的 AI API 地址", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages, stream: true })
              });
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullText = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                // 解析 chunk（根据您 API 的格式），然后调用 onChunk 更新界面
                // onChunk(partial, fullText);
              }
              */
            },

            // 显示提示
            showToast: function (msg) {
              if (roche.ui && roche.ui.toast) {
                roche.ui.toast(msg);
              } else {
                alert(msg);
              }
            }
          };

          // 4. 现在 HTML 中的脚本会使用 window.MIBU，我们已经做了适配
          //    但如果脚本在注入时已经执行，可能需要重新触发初始化
          //    由于我们用了 innerHTML，其中的 <script> 不会自动执行，
          //    所以需要手动提取并 eval 执行。
          //    我们可以直接执行其中的脚本（用更安全的方式）
          const scripts = appDiv.querySelectorAll("script");
          scripts.forEach(script => {
            const newScript = document.createElement("script");
            newScript.textContent = script.textContent;
            // 移除原 script 标签，避免重复
            script.parentNode.removeChild(script);
            appDiv.appendChild(newScript);
          });

          // 5. 销毁时清理
          container.__cleanup = () => {
            // 移除可能添加的全局事件监听等
            // 这里可以留空，因为页面卸载时会自动清理
          };
        },

        async unmount(container) {
          if (container.__cleanup) container.__cleanup();
          container.innerHTML = "";
        }
      }
    ]
  });
})();