# 🚀 PhotoSync 快速部署指南

本指南将帮助您快速设置 PhotoSync 的自动化部署流程。

## 📋 前置要求

- GitHub 仓库
- Docker Hub 或 GitHub Container Registry 账户
- 基本的 Git 知识

## ⚡ 5分钟快速设置

### 1. 启用 GitHub Actions

1. 进入您的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 如果首次使用，点击 **I understand my workflows, go ahead and enable them**

### 2. 配置 Container Registry

1. 进入仓库 **Settings** → **Packages**
2. 确保 **GitHub Container Registry** 已启用
3. 设置适当的权限

### 3. 创建第一个发布

```bash
# Windows 用户
scripts\release.bat 1.0.0 --dry-run

# Linux/macOS 用户
./scripts/release.sh 1.0.0 --dry-run
```

查看预览后，执行实际发布：

```bash
# Windows
scripts\release.bat 1.0.0

# Linux/macOS
./scripts/release.sh 1.0.0
```

### 4. 验证部署

1. 进入 **Actions** 页面查看工作流状态
2. 进入 **Packages** 页面查看 Docker 镜像
3. 进入 **Releases** 页面查看发布

## 🎯 核心工作流

### Docker Build and Push
- **触发**: 推送 `v*` 标签
- **功能**: 构建并推送 Docker 镜像
- **输出**: GitHub Release + Docker 镜像

### Multi-Architecture Build
- **触发**: 推送 `v*` 标签
- **功能**: 构建多架构镜像 (AMD64 + ARM64)
- **输出**: 支持多种 CPU 架构的镜像

### CI/CD Pipeline
- **触发**: 推送到 `main`/`develop` 分支
- **功能**: 代码检查 + 测试 + 部署
- **输出**: 自动部署到开发/生产环境

## 📦 使用 Docker 镜像

发布后，您可以使用以下命令拉取和运行镜像：

```bash
# 拉取最新版本
docker pull ghcr.io/your-username/photosync:1.0.0

# 运行容器
docker run -d \
  --name photosync \
  -p 8080:3000 \
  -v photosync-storage:/app/storage \
  -v photosync-data:/app/data \
  ghcr.io/your-username/photosync:1.0.0
```

## 🔧 自定义配置

### 修改镜像仓库

编辑 `.github/workflows/*.yml` 文件中的 `REGISTRY` 变量：

```yaml
env:
  REGISTRY: docker.io  # 使用 Docker Hub
  # 或
  REGISTRY: ghcr.io    # 使用 GitHub Container Registry
```

### 添加自定义环境变量

在仓库 **Settings** → **Secrets and variables** → **Actions** 中添加：

- `DOCKER_USERNAME`: Docker 用户名
- `DOCKER_PASSWORD`: Docker 密码
- `DEPLOY_TOKEN`: 部署令牌

## 🚨 故障排除

### 常见问题

**Q: 工作流没有触发**
A: 检查标签格式是否正确 (必须以 `v` 开头)

**Q: Docker 构建失败**
A: 检查 Dockerfile 路径和内容

**Q: 推送权限被拒绝**
A: 检查 Container Registry 权限设置

**Q: 版本号格式错误**
A: 使用语义化版本格式 (例如: 1.0.0)

### 调试步骤

1. 查看 **Actions** 页面的详细日志
2. 检查仓库权限设置
3. 验证标签格式
4. 确认 Dockerfile 存在且正确

## 📚 下一步

- 阅读 [GITHUB_WORKFLOWS.md](./GITHUB_WORKFLOWS.md) 了解详细配置
- 查看 [API.md](./API.md) 了解 API 接口
- 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解部署选项

## 🆘 获取帮助

如果遇到问题：

1. 查看 GitHub Issues
2. 检查工作流日志
3. 参考官方文档
4. 联系维护团队

---

**提示**: 首次使用建议先运行 `--dry-run` 模式预览操作，确认无误后再执行实际发布。
