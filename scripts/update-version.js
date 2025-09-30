#!/usr/bin/env node

/**
 * PhotoSync Version Update Script
 * 更新所有package.json文件中的版本号
 * 
 * Usage: node scripts/update-version.js [version]
 * Example: node scripts/update-version.js 1.0.2
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
    console.error('错误: 请提供版本号');
    console.log('用法: node scripts/update-version.js [version]');
    console.log('示例: node scripts/update-version.js 1.0.2');
    process.exit(1);
}

// 验证版本号格式 (简单验证)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
    console.error('错误: 版本号格式不正确');
    console.log('版本号格式应为: x.y.z (例如: 1.0.2)');
    process.exit(1);
}

// 需要更新的package.json文件路径
const packageFiles = [
    'package.json',
    'package-lock.json',
    'client/package.json',
    'client/package-lock.json',
    'server/package.json',
    'server/package-lock.json'
];

console.log(`正在更新版本号到: ${newVersion}`);
console.log('=====================================');

let successCount = 0;
let errorCount = 0;

packageFiles.forEach(filePath => {
    try {
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  跳过: ${filePath} (文件不存在)`);
            return;
        }

        // 读取package.json文件
        const packageContent = fs.readFileSync(filePath, 'utf8');
        const packageJson = JSON.parse(packageContent);

        // 获取旧版本号
        const oldVersion = packageJson.version;

        // 更新版本号
        packageJson.version = newVersion;

        // 写回文件
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');

        console.log(`✅ 已更新: ${filePath} (${oldVersion} → ${newVersion})`);
        successCount++;

    } catch (error) {
        console.error(`❌ 更新失败: ${filePath}`);
        console.error(`   错误: ${error.message}`);
        errorCount++;
    }
});

console.log('=====================================');
console.log(`更新完成! 成功: ${successCount}, 失败: ${errorCount}`);

if (errorCount > 0) {
    console.log('\n请检查上述错误并手动修复');
    process.exit(1);
} else {
    console.log('\n所有package.json文件已成功更新!');
    console.log('\n下一步:');
    console.log('1. 检查更改: git diff');
    console.log('2. 提交更改: git add . && git commit -m "chore: bump version to ' + newVersion + '"');
    console.log('3. 创建发布: scripts\\release.bat');
}
