# 版本管理和自动标签功能

本文档介绍了 PhotoSync 项目的版本管理和自动标签功能的使用方法。

## 🚀 快速开始

### 基本用法

```bash
# 更新版本号并自动打tag
npm run version 1.0.4

# 或者直接使用脚本
node scripts/update-version.js 1.0.4
```

### 跳过标签创建

```bash
# 只更新版本号，不创建标签
npm run version:no-tag 1.0.4

# 或者使用脚本
node scripts/update-version.js 1.0.4 --no-tag
```

## 📋 功能特性

### 自动版本更新
- ✅ 更新所有 `package.json` 文件中的版本号
- ✅ 支持根目录、客户端和服务端的版本同步
- ✅ 验证版本号格式 (x.y.z)

### 自动Git操作
- ✅ 检查Git仓库状态
- ✅ 检测未提交的更改
- ✅ 自动提交版本更改
- ✅ 创建带注释的Git标签
- ✅ 推送标签到远程仓库

### 智能错误处理
- ✅ 检查标签是否已存在
- ✅ 验证Git仓库状态
- ✅ 提供详细的错误信息和解决建议
- ✅ 支持用户确认机制

## 🔧 使用场景

### 场景1: 正常发布
```bash
# 1. 确保工作目录干净
git status

# 2. 更新版本并打标签
npm run version 1.0.4

# 3. GitHub Actions 自动触发
#    - 构建Docker镜像
#    - 推送到GitHub Container Registry
#    - 创建GitHub Release
```

### 场景2: 有未提交更改
```bash
# 脚本会检测到未提交的更改并提示
npm run version 1.0.4

# 输出示例:
# ⚠️  警告: 工作目录有未提交的更改:
# M  src/components/Header.js
# 
# 建议先提交或暂存这些更改，然后再创建标签。
# 如果继续，版本更改将被自动提交。
# 
# 按 Ctrl+C 取消，或按 Enter 继续...
```

### 场景3: 只更新版本号
```bash
# 开发过程中只更新版本号，稍后手动打标签
npm run version:no-tag 1.0.4-beta.1
```

## 📝 脚本参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `version` | 版本号 (必需) | `1.0.4` |
| `--no-tag` | 跳过标签创建 | `--no-tag` |

## 🔍 脚本执行流程

1. **参数验证**
   - 检查版本号格式
   - 验证命令行参数

2. **Git状态检查**
   - 检查是否为Git仓库
   - 检测未提交的更改
   - 验证标签是否已存在

3. **版本更新**
   - 更新所有 `package.json` 文件
   - 显示更新结果统计

4. **Git操作** (如果启用)
   - 提交版本更改
   - 创建带注释的标签
   - 推送标签到远程仓库

5. **结果反馈**
   - 显示操作结果
   - 提供后续操作建议

## 🛠️ 故障排除

### 常见问题

**问题1: 标签已存在**
```
❌ 错误: 标签 v1.0.4 已存在
请使用不同的版本号或删除现有标签
```
**解决方案:** 使用不同的版本号或删除现有标签

**问题2: 不是Git仓库**
```
⚠️  警告: 当前目录不是Git仓库，将跳过Git操作
```
**解决方案:** 初始化Git仓库或切换到正确的目录

**问题3: 推送失败**
```
❌ 创建或推送标签失败: Permission denied
```
**解决方案:** 检查Git远程仓库配置和权限

### 手动操作

如果自动操作失败，可以手动执行以下步骤：

```bash
# 1. 检查更改
git diff

# 2. 提交版本更改
git add .
git commit -m "chore: bump version to 1.0.4"

# 3. 创建标签
git tag -a v1.0.4 -m "Release version 1.0.4"

# 4. 推送标签
git push origin v1.0.4
```

## 🔗 相关功能

### GitHub Actions 集成

创建标签后，以下GitHub Actions工作流会自动触发：

- **Docker Build and Push**: 构建并推送Docker镜像
- **Multi-Architecture Build**: 构建多架构镜像
- **CI/CD Pipeline**: 运行测试和部署

### 版本号规范

建议使用[语义化版本](https://semver.org/lang/zh-CN/)规范：

- **主版本号** (MAJOR): 不兼容的API修改
- **次版本号** (MINOR): 向下兼容的功能性新增
- **修订号** (PATCH): 向下兼容的问题修正

示例：
- `1.0.0` - 初始版本
- `1.1.0` - 新功能
- `1.1.1` - 错误修复
- `2.0.0` - 重大更新

## 📚 更多信息

- [Git标签文档](https://git-scm.com/book/zh/v2/Git-基础-打标签)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [GitHub Actions文档](https://docs.github.com/actions)
- [项目GitHub工作流说明](./GITHUB_WORKFLOWS.md)

---

**注意**: 请确保在使用前已正确配置Git远程仓库，并且有推送权限。
