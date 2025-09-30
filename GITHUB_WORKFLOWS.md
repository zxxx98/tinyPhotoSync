# GitHub Actions 工作流说明

本文档详细介绍了 PhotoSync 项目的 GitHub Actions 自动化工作流配置和使用方法。

## 📋 工作流概览

项目包含以下三个主要工作流：

1. **Docker Build and Push** - 基于标签的 Docker 镜像构建和发布
2. **Multi-Architecture Build** - 多架构 Docker 镜像构建
3. **CI/CD Pipeline** - 完整的持续集成和部署流程

## 🚀 快速开始

### 1. 设置 GitHub Container Registry

首先需要在 GitHub 仓库中启用 Container Registry：

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Packages**
3. 确保 **GitHub Container Registry** 已启用

### 2. 配置仓库权限

确保以下权限已正确设置：

- **Actions**: 启用 GitHub Actions
- **Packages**: 允许 Actions 写入包
- **Contents**: 允许 Actions 读取仓库内容

### 3. 创建发布标签

使用提供的脚本创建发布：

```bash
# Windows
scripts\release.bat 1.0.0

# Linux/macOS
./scripts/release.sh 1.0.0
```

## 📦 工作流详解

### Docker Build and Push (`docker-build-and-push.yml`)

**触发条件：**
- 推送以 `v` 开头的标签 (例如: `v1.0.0`)
- 手动触发工作流

**功能：**
- 构建 Docker 镜像
- 推送到 GitHub Container Registry
- 自动创建 GitHub Release
- 更新 package.json 版本

**使用示例：**
```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

### Multi-Architecture Build (`multi-arch-build.yml`)

**触发条件：**
- 推送以 `v` 开头的标签
- 手动触发工作流

**功能：**
- 构建多架构 Docker 镜像 (linux/amd64, linux/arm64)
- 生成软件物料清单 (SBOM)
- 推送到 GitHub Container Registry
- 创建详细的 GitHub Release

**支持的架构：**
- `linux/amd64` - Intel/AMD 64位
- `linux/arm64` - ARM 64位

### CI/CD Pipeline (`ci-cd.yml`)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request
- 手动触发

**功能：**
- 代码质量检查
- 运行测试
- 构建 Docker 镜像
- 部署到开发/生产环境
- 安全扫描

## 🛠️ 发布流程

### 自动发布流程

1. **创建发布标签**
   ```bash
   # 使用脚本 (推荐)
   scripts\release.bat 1.0.0
   
   # 或手动创建
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions 自动执行**
   - 构建 Docker 镜像
   - 推送到镜像仓库
   - 创建 GitHub Release
   - 更新版本信息

3. **验证发布**
   - 检查 GitHub Release 页面
   - 验证 Docker 镜像是否可用
   - 测试部署

### 手动发布流程

如果需要手动控制发布过程：

1. **准备发布**
   ```bash
   # 更新版本号
   npm version 1.0.0 --no-git-tag-version
   
   # 更新 CHANGELOG.md
   # 提交更改
   git add .
   git commit -m "chore: prepare release v1.0.0"
   ```

2. **创建标签**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. **触发工作流**
   - 进入 GitHub Actions 页面
   - 选择 "Docker Build and Push" 工作流
   - 点击 "Run workflow"
   - 输入版本标签

## 🔧 配置说明

### 环境变量

工作流使用以下环境变量：

- `REGISTRY`: Docker 镜像仓库地址 (默认: `ghcr.io`)
- `IMAGE_NAME`: 镜像名称 (默认: `${{ github.repository }}`)
- `NODE_VERSION`: Node.js 版本 (默认: `18`)

### 权限配置

工作流需要以下权限：

```yaml
permissions:
  contents: read      # 读取仓库内容
  packages: write     # 写入包到 Container Registry
```

### 密钥配置

确保以下密钥已配置：

- `GITHUB_TOKEN`: 自动提供，用于访问 GitHub API
- 其他自定义密钥 (如果需要)

## 📊 监控和调试

### 查看工作流状态

1. 进入仓库的 **Actions** 页面
2. 选择相应的工作流
3. 查看运行历史和日志

### 常见问题排查

**问题 1: 权限不足**
```
Error: Resource not accessible by integration
```
**解决方案:** 检查仓库权限设置，确保 Actions 有足够权限

**问题 2: Docker 构建失败**
```
Error: failed to solve: failed to read dockerfile
```
**解决方案:** 检查 Dockerfile 路径和内容

**问题 3: 推送失败**
```
Error: failed to push: denied: permission_denied
```
**解决方案:** 检查 Container Registry 权限和认证

### 日志分析

工作流提供详细的日志信息：

- **构建日志**: Docker 构建过程
- **测试日志**: 单元测试和集成测试结果
- **部署日志**: 部署过程状态
- **安全扫描**: 漏洞扫描结果

## 🔒 安全考虑

### 容器安全

- 使用多阶段构建减少镜像大小
- 定期更新基础镜像
- 运行安全扫描 (Trivy)
- 生成软件物料清单 (SBOM)

### 访问控制

- 使用最小权限原则
- 定期轮换密钥
- 监控异常活动
- 启用分支保护规则

## 📈 最佳实践

### 版本管理

1. **使用语义化版本**
   - 格式: `MAJOR.MINOR.PATCH`
   - 示例: `1.0.0`, `1.1.0`, `1.1.1`

2. **标签命名规范**
   - 使用 `v` 前缀
   - 示例: `v1.0.0`, `v2.0.0-beta.1`

3. **变更日志**
   - 记录所有重要变更
   - 使用标准格式
   - 及时更新

### 发布策略

1. **开发流程**
   - 功能开发在 `develop` 分支
   - 定期合并到 `main` 分支
   - 使用 Pull Request 进行代码审查

2. **发布流程**
   - 从 `main` 分支创建发布标签
   - 使用自动化脚本
   - 验证发布结果

3. **回滚策略**
   - 保留旧版本镜像
   - 快速回滚机制
   - 监控和告警

## 🚀 高级功能

### 多环境部署

工作流支持多环境部署：

- **开发环境**: `develop` 分支自动部署
- **生产环境**: `main` 分支自动部署
- **手动部署**: 通过工作流调度

### 通知集成

可以集成以下通知方式：

- **Slack**: 部署状态通知
- **邮件**: 重要事件通知
- **Webhook**: 自定义通知

### 自定义配置

可以通过以下方式自定义工作流：

1. **修改触发条件**
2. **添加自定义步骤**
3. **配置环境变量**
4. **集成外部服务**

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/actions)
- [Docker 多阶段构建](https://docs.docker.com/build/building/multi-stage/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)

## 🤝 贡献指南

如果您想改进这些工作流：

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
5. 等待代码审查

## 📞 支持

如果您遇到问题或有建议：

1. 查看 [Issues](https://github.com/your-repo/issues) 页面
2. 创建新的 Issue
3. 提供详细的错误信息
4. 附上相关日志

---

**注意**: 请根据您的实际需求调整工作流配置，确保所有路径和参数都正确设置。
