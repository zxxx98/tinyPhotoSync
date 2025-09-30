#!/usr/bin/env node

/**
 * PhotoSync Version Update Script
 * 更新所有package.json文件中的版本号并自动打tag
 * 
 * Usage: node scripts/update-version.js [version] [--no-tag]
 * Example: node scripts/update-version.js 1.0.2
 * Example: node scripts/update-version.js 1.0.2 --no-tag
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const newVersion = args[0];
const noTag = args.includes('--no-tag');

if (!newVersion) {
    console.error('错误: 请提供版本号');
    console.log('用法: node scripts/update-version.js [version] [--no-tag]');
    console.log('示例: node scripts/update-version.js 1.0.2');
    console.log('示例: node scripts/update-version.js 1.0.2 --no-tag');
    process.exit(1);
}

// 验证版本号格式 (简单验证)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
    console.error('错误: 版本号格式不正确');
    console.log('版本号格式应为: x.y.z (例如: 1.0.2)');
    process.exit(1);
}

// Git 操作相关函数
function isGitRepository() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function getGitStatus() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim();
    } catch (error) {
        throw new Error('无法获取Git状态');
    }
}

function getCurrentBranch() {
    try {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' });
        return branch.trim();
    } catch (error) {
        throw new Error('无法获取当前分支');
    }
}

function checkTagExists(tagName) {
    try {
        execSync(`git rev-parse --verify ${tagName}`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function createAndPushTag(tagName, message) {
    try {
        // 创建标签
        execSync(`git tag -a ${tagName} -m "${message}"`, { stdio: 'inherit' });
        console.log(`✅ 已创建标签: ${tagName}`);
        
        // 推送标签到远程仓库
        execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
        console.log(`✅ 已推送标签到远程仓库: ${tagName}`);
        
        return true;
    } catch (error) {
        console.error(`❌ 创建或推送标签失败: ${error.message}`);
        return false;
    }
}

function commitVersionChanges(version) {
    try {
        // 添加所有更改的文件
        execSync('git add .', { stdio: 'inherit' });
        
        // 提交更改
        execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });
        console.log(`✅ 已提交版本更改: ${version}`);
        
        return true;
    } catch (error) {
        console.error(`❌ 提交版本更改失败: ${error.message}`);
        return false;
    }
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

// 检查Git仓库状态
let gitOperations = true;
if (!isGitRepository()) {
    console.log('⚠️  警告: 当前目录不是Git仓库，将跳过Git操作');
    gitOperations = false;
} else if (!noTag) {
    try {
        const gitStatus = getGitStatus();
        if (gitStatus) {
            console.log('⚠️  警告: 工作目录有未提交的更改:');
            console.log(gitStatus);
            console.log('\n建议先提交或暂存这些更改，然后再创建标签。');
            console.log('如果继续，版本更改将被自动提交。');
            console.log('\n按 Ctrl+C 取消，或按 Enter 继续...');
            
            // 等待用户确认
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                console.log('\n继续执行...\n');
            });
        }
        
        const currentBranch = getCurrentBranch();
        console.log(`📍 当前分支: ${currentBranch}`);
        
        const tagName = `v${newVersion}`;
        if (checkTagExists(tagName)) {
            console.error(`❌ 错误: 标签 ${tagName} 已存在`);
            console.log('请使用不同的版本号或删除现有标签');
            process.exit(1);
        }
        
        console.log(`🏷️  将创建标签: ${tagName}`);
    } catch (error) {
        console.error(`❌ Git检查失败: ${error.message}`);
        gitOperations = false;
    }
}

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
    
    // 执行Git操作
    if (gitOperations && !noTag) {
        console.log('\n🔄 开始Git操作...');
        
        try {
            // 提交版本更改
            if (commitVersionChanges(newVersion)) {
                // 创建并推送标签
                const tagName = `v${newVersion}`;
                const tagMessage = `Release version ${newVersion}`;
                
                if (createAndPushTag(tagName, tagMessage)) {
                    console.log('\n🎉 版本更新和标签创建完成!');
                    console.log(`📦 标签: ${tagName}`);
                    console.log(`📝 提交信息: chore: bump version to ${newVersion}`);
                    console.log('\n✨ GitHub Actions 将自动触发以下操作:');
                    console.log('   - 构建Docker镜像');
                    console.log('   - 推送到GitHub Container Registry');
                    console.log('   - 创建GitHub Release');
                } else {
                    console.log('\n⚠️  版本更新成功，但标签创建失败');
                    console.log('请手动创建标签:');
                    console.log(`   git tag -a ${tagName} -m "Release version ${newVersion}"`);
                    console.log(`   git push origin ${tagName}`);
                }
            } else {
                console.log('\n⚠️  版本更新成功，但提交失败');
                console.log('请手动提交更改:');
                console.log('   git add .');
                console.log(`   git commit -m "chore: bump version to ${newVersion}"`);
            }
        } catch (error) {
            console.error(`\n❌ Git操作失败: ${error.message}`);
            console.log('\n请手动执行以下操作:');
            console.log('1. 检查更改: git diff');
            console.log('2. 提交更改: git add . && git commit -m "chore: bump version to ' + newVersion + '"');
            console.log(`3. 创建标签: git tag -a v${newVersion} -m "Release version ${newVersion}"`);
            console.log(`4. 推送标签: git push origin v${newVersion}`);
        }
    } else if (noTag) {
        console.log('\n📝 版本更新完成 (跳过标签创建)');
        console.log('\n下一步:');
        console.log('1. 检查更改: git diff');
        console.log('2. 提交更改: git add . && git commit -m "chore: bump version to ' + newVersion + '"');
        console.log(`3. 手动创建标签: git tag -a v${newVersion} -m "Release version ${newVersion}"`);
        console.log(`4. 推送标签: git push origin v${newVersion}`);
    } else {
        console.log('\n📝 版本更新完成 (非Git仓库)');
        console.log('\n下一步:');
        console.log('1. 初始化Git仓库: git init');
        console.log('2. 添加文件: git add .');
        console.log('3. 提交更改: git commit -m "chore: bump version to ' + newVersion + '"');
        console.log(`4. 创建标签: git tag -a v${newVersion} -m "Release version ${newVersion}"`);
    }
}
