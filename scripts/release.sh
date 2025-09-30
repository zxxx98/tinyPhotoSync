#!/bin/bash

# PhotoSync 发布脚本
# 使用方法: ./scripts/release.sh [版本号] [选项]
# 例如: ./scripts/release.sh 1.0.0 --dry-run

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认参数
DRY_RUN=false
PUSH_TAG=true
UPDATE_CHANGELOG=true

# 解析参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-push)
      PUSH_TAG=false
      shift
      ;;
    --no-changelog)
      UPDATE_CHANGELOG=false
      shift
      ;;
    -h|--help)
      echo "PhotoSync 发布脚本"
      echo ""
      echo "使用方法: $0 [版本号] [选项]"
      echo ""
      echo "参数:"
      echo "  版本号              要发布的版本号 (例如: 1.0.0)"
      echo ""
      echo "选项:"
      echo "  --dry-run          只显示将要执行的操作，不实际执行"
      echo "  --no-push          不推送标签到远程仓库"
      echo "  --no-changelog     不更新 CHANGELOG.md"
      echo "  -h, --help         显示此帮助信息"
      echo ""
      echo "示例:"
      echo "  $0 1.0.0                    # 发布版本 1.0.0"
      echo "  $0 1.0.0 --dry-run          # 预览发布操作"
      echo "  $0 1.0.0 --no-push          # 只创建本地标签"
      exit 0
      ;;
    *)
      if [[ -z "$VERSION" ]]; then
        VERSION="$1"
      else
        echo -e "${RED}错误: 未知参数 $1${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

# 检查版本号
if [[ -z "$VERSION" ]]; then
  echo -e "${RED}错误: 请提供版本号${NC}"
  echo "使用方法: $0 [版本号] [选项]"
  echo "使用 $0 --help 查看详细帮助"
  exit 1
fi

# 验证版本号格式 (语义化版本)
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
  echo -e "${RED}错误: 版本号格式不正确${NC}"
  echo "请使用语义化版本格式，例如: 1.0.0, 1.0.0-beta.1, 1.0.0+20230101"
  exit 1
fi

# 检查工作目录是否干净
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}错误: 工作目录不干净，请先提交或暂存所有更改${NC}"
  git status --short
  exit 1
fi

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  echo -e "${YELLOW}警告: 当前不在主分支 (main/master)，当前分支: $CURRENT_BRANCH${NC}"
  read -p "是否继续? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 检查标签是否已存在
if git tag -l | grep -q "^v$VERSION$"; then
  echo -e "${RED}错误: 标签 v$VERSION 已存在${NC}"
  exit 1
fi

echo -e "${BLUE}🚀 PhotoSync 发布流程${NC}"
echo -e "${BLUE}====================${NC}"
echo -e "版本号: ${GREEN}v$VERSION${NC}"
echo -e "当前分支: ${GREEN}$CURRENT_BRANCH${NC}"
echo -e "干运行: ${GREEN}$DRY_RUN${NC}"
echo -e "推送标签: ${GREEN}$PUSH_TAG${NC}"
echo -e "更新变更日志: ${GREEN}$UPDATE_CHANGELOG${NC}"
echo ""

# 更新 package.json 版本
echo -e "${YELLOW}📦 更新 package.json 版本...${NC}"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  [DRY RUN] 将更新根目录 package.json 版本为 $VERSION"
  echo "  [DRY RUN] 将更新 client/package.json 版本为 $VERSION"
  echo "  [DRY RUN] 将更新 server/package.json 版本为 $VERSION"
else
  pnpm version "$VERSION" --no-git-tag-version
  cd client && pnpm version "$VERSION" --no-git-tag-version && cd ..
  cd server && pnpm version "$VERSION" --no-git-tag-version && cd ..
fi

# 更新 CHANGELOG.md
if [[ "$UPDATE_CHANGELOG" == "true" ]]; then
  echo -e "${YELLOW}📝 更新 CHANGELOG.md...${NC}"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN] 将在 CHANGELOG.md 顶部添加版本 $VERSION 的条目"
  else
    # 创建 CHANGELOG.md 如果不存在
    if [[ ! -f "CHANGELOG.md" ]]; then
      cat > CHANGELOG.md << EOF
# 变更日志

所有重要的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且此项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 初始版本

EOF
    fi
    
    # 获取当前日期
    DATE=$(date +"%Y-%m-%d")
    
    # 在 CHANGELOG.md 顶部插入新版本
    sed -i "1a\\
\\
## [$VERSION] - $DATE\\
\\
### 新增\\
- 请在此处添加新功能\\
\\
### 更改\\
- 请在此处添加更改\\
\\
### 修复\\
- 请在此处添加修复\\
\\
" CHANGELOG.md
  fi
fi

# 提交更改
echo -e "${YELLOW}💾 提交更改...${NC}"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  [DRY RUN] 将提交 package.json 和 CHANGELOG.md 的更改"
else
  git add package.json client/package.json server/package.json
  if [[ "$UPDATE_CHANGELOG" == "true" ]]; then
    git add CHANGELOG.md
  fi
  git commit -m "chore: prepare release v$VERSION"
fi

# 创建标签
echo -e "${YELLOW}🏷️  创建标签...${NC}"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  [DRY RUN] 将创建标签 v$VERSION"
else
  git tag -a "v$VERSION" -m "Release v$VERSION"
fi

# 推送更改和标签
if [[ "$PUSH_TAG" == "true" ]]; then
  echo -e "${YELLOW}📤 推送更改和标签...${NC}"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN] 将推送提交和标签到远程仓库"
  else
    git push origin "$CURRENT_BRANCH"
    git push origin "v$VERSION"
  fi
fi

echo ""
echo -e "${GREEN}✅ 发布流程完成！${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo -e "1. GitHub Actions 将自动构建 Docker 镜像"
echo -e "2. 镜像将推送到: ${GREEN}ghcr.io/$USERNAME/photosync:v$VERSION${NC}"
echo -e "3. 将自动创建 GitHub Release"
echo ""
echo -e "${BLUE}手动操作 (如果需要):${NC}"
echo -e "- 编辑 CHANGELOG.md 添加详细的变更内容"
echo -e "- 检查 GitHub Release 页面并完善发布说明"
echo -e "- 通知团队成员新版本已发布"

if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo -e "${YELLOW}💡 这是干运行模式，没有实际执行任何操作${NC}"
  echo -e "要实际执行发布，请运行: ${GREEN}$0 $VERSION${NC}"
fi
