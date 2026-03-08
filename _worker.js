export default {
  async fetch(request) {
    // 只有当用户通过 POST 提交日志时，我们才处理数据
    // 如果是 GET 请求，直接返回网页
    
    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>日志脱敏 (Worker版)</title>
        <!-- 使用 Classless CSS 自动美化 -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
        <style>
            textarea { font-family: monospace; width: 100%; height: 200px; }
        </style>
    </head>
    <body>
        <h3>🛡️ Cloudflare Worker 日志脱敏</h3>
        <p>所有处理均在您的浏览器本地完成，不会发送到任何服务器。</p>
        <p>对ipv4/6 进行脱敏（本地/私有地址不脱敏）</p>
        <p>@AI</p>
        
        <label>原始日志:</label>
        <textarea id="input" placeholder="粘贴日志到这里..."></textarea>
        
        <label>脱敏结果:</label>
        <textarea id="output" readonly placeholder="结果会显示在这里..."></textarea>
        
        <button onclick="copyResult()">📋 复制结果</button>

        <script>
            const input = document.getElementById('input');
            const output = document.getElementById('output');

            // 实时监听输入，自动脱敏
            input.addEventListener('input', () => {
                let text = input.value;
                
                // 1. 替换 IPv4，排除本地/私有地址
                // 排除: 10.x.x.x / 127.x.x.x / 169.254.x.x / 192.168.x.x / 172.16~31.x.x
                text = text.replace(/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/g, (match) => {
                    if (
                        /^10\\./.test(match) ||
                        /^127\\./.test(match) ||
                        /^169\.254\\./.test(match) ||
                        /^192\.168\\./.test(match) ||
                        /^172\\.(1[6-9]|2\\d|3[01])\\./.test(match)
                    ) return match;
                    return '0.0.0.0';
                });

                // 2. 替换 IPv6 (排除时间戳)
                // 匹配规则: 至少两个冒号分隔的 hex 块
                text = text.replace(/\\b([0-9a-fA-F]{1,4}:){2,}[0-9a-fA-F]{1,4}\\b/g, (match) => {
                    // 如果长得像时间 (HH:MM:SS)，则忽略
                    if (/^\\d{2}:\\d{2}:\\d{2}$/.test(match)) return match;
                    return '::';
                });

                output.value = text;
            });

            function copyResult() {
                output.select();
                document.execCommand('copy');
                alert('已复制!');
            }
        </script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};