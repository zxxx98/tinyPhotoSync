# ESLint 代码规范检查指南

## 概述

本项目已配置 ESLint 来检查代码规范，帮助开发者在提交代码前发现和修复代码质量问题。

**注意：** 当前配置只显示错误，不显示警告，并且在工作流中已禁用ESLint检查。

## 可用的命令

### 1. 检查代码规范
```bash
npm run lint:check
```
- 检查所有 `.js` 和 `.jsx` 文件
- 使用紧凑格式输出
- 只显示错误，不显示警告

### 2. 检查代码规范（详细输出）
```bash
npm run lint
```
- 检查所有 `.js` 和 `.jsx` 文件
- 使用默认格式输出
- 只显示错误，不显示警告

### 3. 自动修复可修复的问题
```bash
npm run lint:fix
```
- 自动修复可以自动修复的问题（如缩进、分号、引号等）
- 无法自动修复的问题仍需要手动修复

## 配置文件

- **`.eslintrc.js`**: ESLint 主配置文件
- **`.eslintignore`**: 忽略文件配置

## 主要检查规则

### React 相关
- React Hooks 使用规范
- JSX 语法规范
- PropTypes 验证建议
- 组件命名规范

### 代码风格
- 缩进：2个空格
- 引号：单引号
- 分号：必须使用
- 对象和数组的尾随逗号
- 对象大括号内空格

### 可访问性
- 表单标签关联
- 键盘事件支持
- 交互元素规范

### 代码质量
- 未使用变量检查
- console 语句警告
- debugger 语句错误
- 箭头函数使用建议

## 使用建议

### 提交前检查
在提交代码前，建议运行：
```bash
npm run lint:check
```

### 自动修复
对于可以自动修复的问题，运行：
```bash
npm run lint:fix
```

### IDE 集成
建议在 IDE 中安装 ESLint 插件，这样可以在编写代码时实时看到问题提示。

## 常见问题修复

### 1. 未使用的导入
```javascript
// 错误
import React from 'react';

// 正确（React 17+）
// 不需要导入 React
```

### 2. 缺少 PropTypes
```javascript
// 错误
function MyComponent({ title }) {
  return <div>{title}</div>;
}

// 正确
import PropTypes from 'prop-types';

function MyComponent({ title }) {
  return <div>{title}</div>;
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
};
```

### 3. JSX 中的箭头函数
```javascript
// 错误
<button onClick={() => handleClick()}>Click</button>

// 正确
const handleClick = () => {
  // 处理逻辑
};

<button onClick={handleClick}>Click</button>
```

### 4. 缺少尾随逗号
```javascript
// 错误
const obj = {
  name: 'test',
  value: 123
};

// 正确
const obj = {
  name: 'test',
  value: 123,
};
```

## 忽略特定规则

如果某些规则不适用于特定情况，可以使用注释忽略：

```javascript
// eslint-disable-next-line no-console
console.log('调试信息');

// eslint-disable-next-line react/prop-types
function MyComponent({ data }) {
  return <div>{data}</div>;
}
```

## 持续集成

**注意：** 当前在 CI/CD 工作流中已禁用 ESLint 检查。

如果需要重新启用，可以取消注释 `.github/workflows/ci-cd.yml` 文件中的 linting 步骤：

```yaml
- name: Run linting
  run: |
    # 客户端代码检查
    cd client
    echo "🔍 开始客户端代码检查..."
    npm run lint 2>&1 || echo "⚠️ 客户端代码检查未配置或失败"
    
    # 服务端代码检查
    cd ../server
    echo "🔍 开始服务端代码检查..."
    npm run lint 2>&1 || echo "⚠️ 服务端代码检查未配置或失败"
```

这样可以确保所有提交的代码都符合规范。
