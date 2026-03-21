# Humanize Backend

基于 FastAPI 的文本人性化处理后端服务，使用 StealthGPT API 将 AI 生成的文本转换为更自然的人类风格文本。

## 功能特性

- 文本人性化处理（通过 StealthGPT API）
- 支持多种语调风格
- 自动文本分块处理（支持长文本）
- 健康检查接口
- CORS 支持
- 异步处理

## 技术栈

- **FastAPI** - 现代、快速的 Web 框架
- **Uvicorn** - ASGI 服务器
- **aiohttp** - 异步 HTTP 客户端
- **Pydantic** - 数据验证
- **python-dotenv** - 环境变量管理

## 快速开始

### 1. 环境要求

- Python 3.8+
- pip 或 poetry

### 2. 安装依赖

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### 3. 环境配置

创建 `.env` 文件并配置 StealthGPT API Key：

```env
STEALTH_API_KEY=your_stealth_api_key_here
```

### 4. 启动服务

```bash
# 开发模式（自动重载）
uvicorn main:app --reload --port 8001

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8001
```

服务将在 `http://localhost:8001` 启动

## API 接口

### 健康检查

```http
GET /health
```

**响应示例：**
```json
{
  "status": "ok"
}
```

### 文本人性化

```http
POST /humanize
```

**请求体：**
```json
{
  "text": "要处理的文本内容",
  "tone": "Standard"  // 可选，默认为 "Standard"
}
```

**响应示例：**
```json
{
  "original_text": "要处理的文本内容",
  "humanized_text": "处理后的人性化文本"
}
```

**支持的语调类型：**
- `Standard` - 标准语调（默认）
- `Casual` - 随意语调
- `Professional` - 专业语调
- `Academic` - 学术语调

## API 文档

启动服务后，访问以下地址查看交互式 API 文档：

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 项目结构

```
backend/
├── main.py           # FastAPI 应用入口
├── humanizer.py      # 核心人性化处理逻辑
├── requirements.txt  # Python 依赖
├── .env             # 环境变量配置
├── venv/            # 虚拟环境（生成）
└── README.md        # 项目说明
```

## 核心组件

### Humanizer 类

负责与 StealthGPT API 交互的核心类：

- **文本分块**: 自动将长文本分割成适合处理的块
- **并发处理**: 使用 asyncio 并发处理多个文本块
- **错误处理**: 完善的异常处理和日志记录
- **智能过滤**: 跳过过短的文本块，避免不必要的 API 调用

### 配置参数

- `MAX_CHUNK_WORDS`: 1000 - 单个文本块最大词数
- `MIN_WORDS_TO_PROCESS`: 30 - 最小处理词数阈值

## 开发说明

### 添加新功能

1. 在 `main.py` 中添加新的路由
2. 在 `humanizer.py` 中扩展处理逻辑
3. 更新 Pydantic 模型定义

### 测试 API

使用 curl 测试接口：

```bash
# 健康检查
curl http://localhost:8001/health

# 文本人性化
curl -X POST "http://localhost:8001/humanize" \
     -H "Content-Type: application/json" \
     -d '{"text": "This is a test text.", "tone": "Standard"}'
```

## 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 环境变量

生产环境需要设置的环境变量：

- `STEALTH_API_KEY` - StealthGPT API 密钥（必需）

## 故障排除

### 常见问题

1. **端口占用**: 如果 8001 端口被占用，使用 `--port` 参数指定其他端口
2. **API Key 错误**: 检查 `.env` 文件中的 `STEALTH_API_KEY` 是否正确
3. **依赖安装失败**: 确保 Python 版本 >= 3.8，并使用虚拟环境

### 日志查看

服务启动后会显示详细的日志信息，包括：
- 服务启动状态
- API 请求处理
- 错误信息和异常堆栈

## 许可证

[添加许可证信息]