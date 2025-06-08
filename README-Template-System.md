# BrainBase 模板系统

## 项目概述

BrainBase 模板系统是一个轻量级、高效的前端模板解决方案，旨在提高代码复用性和维护性。系统采用组件化架构，支持模板语法、动态加载、布局管理等现代化功能。

## ✨ 核心特性

### 🧩 组件化架构
- **独立组件**: 头部、侧边栏等组件完全独立，便于维护和更新
- **动态加载**: 支持异步加载组件，提升页面性能
- **可复用性**: 组件可在多个页面间复用，减少重复代码

### 🎯 模板语法
- **变量替换**: 支持 `{{变量名}}` 语法进行数据绑定
- **嵌套访问**: 支持 `{{user.name}}` 点语法访问对象属性
- **条件渲染**: 计划支持 `{{#if}}` 条件语法
- **循环渲染**: 计划支持 `{{#each}}` 循环语法

### 🎨 布局管理
- **响应式设计**: 自动适配不同屏幕尺寸
- **用户自定义**: 支持侧边栏显示/隐藏、宽度调节等
- **主题切换**: 支持浅色/深色主题切换
- **紧凑模式**: 提供紧凑的显示模式

### 📱 设备模拟
- **多设备支持**: 内置主流移动设备尺寸
- **实时预览**: 即时查看在不同设备上的显示效果
- **旋转功能**: 支持横屏/竖屏切换

## 📁 项目结构

```
project/
├── assets/                    # 静态资源目录
│   ├── css/                   # 样式文件
│   │   ├── styles.css         # 主样式文件
│   │   ├── device-simulator.css  # 设备模拟器样式
│   │   ├── menu-management.css   # 菜单管理样式
│   │   └── layout-settings.css   # 布局设置样式
│   └── js/                    # JavaScript文件
│       ├── core.js            # 核心功能模块
│       ├── device-simulator.js   # 设备模拟器
│       ├── menu-management.js    # 菜单管理
│       └── application.js     # 主应用程序
├── components/                # 组件目录
│   ├── header.html           # 头部组件
│   ├── sidebar.html          # 侧边栏组件
│   └── [自定义组件].html      # 其他自定义组件
├── template.html             # 主模板文件
├── example-page.html         # 示例页面
├── master-template-simple.html  # 原始模板（保留）
└── README-Template-System.md # 本文档
```

## 🚀 快速开始

### 1. 基础模板

创建一个新页面时，可以基于 `template.html` 进行开发：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PAGE_TITLE}} - {{SITE_NAME}}</title>
    
    <!-- 引入样式文件 -->
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/device-simulator.css">
    <link rel="stylesheet" href="assets/css/menu-management.css">
    
    <!-- 页面特定样式 -->
    {{PAGE_STYLES}}
</head>
<body class="bg-gray-50">
    <!-- 页面加载器 -->
    <div class="page-loader" id="pageLoader">
        <div class="loader-spinner"></div>
        <div class="loader-text">正在加载页面...</div>
    </div>

    <!-- 组件容器 -->
    <div id="headerContainer"></div>
    <div id="sidebarContainer"></div>

    <!-- 主内容区域 -->
    <main class="gitee-content p-6" id="mainContent">
        {{PAGE_CONTENT}}
    </main>

    <!-- 引入脚本文件 -->
    <script src="assets/js/core.js"></script>
    <script src="assets/js/application.js"></script>
    
    <!-- 页面特定脚本 -->
    {{PAGE_SCRIPTS}}
</body>
</html>
```

### 2. 初始化应用程序

在页面中添加初始化脚本：

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 创建核心实例
        const templateEngine = new BrainBaseCore.TemplateEngine();
        const componentLoader = new BrainBaseCore.ComponentLoader(templateEngine);
        const layoutManager = new BrainBaseCore.LayoutManager();
        
        // 设置模板数据
        templateEngine.setData({
            SITE_NAME: 'BrainBase',
            USER_NAME: '管理员',
            PAGE_TITLE: '您的页面标题'
        });
        
        // 加载组件
        await componentLoader.loadComponents([
            { name: 'header', target: '#headerContainer' },
            { name: 'sidebar', target: '#sidebarContainer' }
        ]);
        
        // 初始化应用程序
        await BrainBaseApp.init({
            templateEngine,
            componentLoader,
            layoutManager
        });
        
        console.log('应用程序初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
    }
});
```

## 📚 API 文档

### 模板引擎 (TemplateEngine)

#### 创建实例
```javascript
const engine = new BrainBaseCore.TemplateEngine();
```

#### 主要方法

##### setData(data)
设置全局模板数据
```javascript
engine.setData({
    SITE_NAME: 'BrainBase',
    USER_NAME: '管理员'
});
```

##### render(template, data)
渲染模板字符串
```javascript
const html = engine.render('Hello {{name}}!', { name: 'World' });
// 输出: Hello World!
```

##### loadTemplate(templatePath)
加载模板文件
```javascript
const template = await engine.loadTemplate('components/header.html');
```

##### renderTemplate(templatePath, data)
加载并渲染模板文件
```javascript
const html = await engine.renderTemplate('components/header.html', {
    title: '页面标题'
});
```

### 组件加载器 (ComponentLoader)

#### 创建实例
```javascript
const loader = new BrainBaseCore.ComponentLoader(templateEngine);
```

#### 主要方法

##### loadComponent(name, target, data)
加载单个组件
```javascript
await loader.loadComponent('header', '#headerContainer', {
    title: '页面标题'
});
```

##### loadComponents(components)
批量加载组件
```javascript
await loader.loadComponents([
    { name: 'header', target: '#headerContainer' },
    { name: 'sidebar', target: '#sidebarContainer' }
]);
```

##### reloadComponent(name, target, data)
重新加载组件
```javascript
await loader.reloadComponent('header', '#headerContainer', {
    title: '新标题'
});
```

### 布局管理器 (LayoutManager)

#### 创建实例
```javascript
const layout = new BrainBaseCore.LayoutManager();
```

#### 主要方法

##### 侧边栏控制
```javascript
layout.setSidebarVisibility(true);  // 显示/隐藏侧边栏
layout.setSidebarWidth(200);        // 设置侧边栏宽度
layout.toggleSidebar();             // 切换侧边栏显示状态
```

##### 主题控制
```javascript
layout.setTheme('dark');            // 设置主题 ('light' | 'dark')
layout.toggleTheme();               // 切换主题
```

##### 模式控制
```javascript
layout.setCompactMode(true);        // 设置紧凑模式
layout.toggleCompactMode();         // 切换紧凑模式
```

##### 设置面板
```javascript
layout.showSettingsPanel();         // 显示布局设置面板
layout.resetSettings();             // 重置所有设置
```

## 🛠️ 自定义组件

### 创建组件文件

在 `components/` 目录下创建 HTML 文件：

```html
<!-- components/my-card.html -->
<div class="my-card">
    <div class="card-header">
        <h3>{{title}}</h3>
        <span class="card-badge">{{badge}}</span>
    </div>
    <div class="card-body">
        <p>{{description}}</p>
        <div class="card-actions">
            <button onclick="{{onEdit}}">编辑</button>
            <button onclick="{{onDelete}}">删除</button>
        </div>
    </div>
</div>
```

### 使用自定义组件

```javascript
await componentLoader.loadComponent('my-card', '#cardContainer', {
    title: '卡片标题',
    badge: '新',
    description: '这是卡片的描述内容',
    onEdit: 'editCard()',
    onDelete: 'deleteCard()'
});
```

## 🎯 模板语法

### 变量替换
```html
<h1>{{title}}</h1>
<p>欢迎，{{user.name}}！</p>
<span>{{user.profile.email}}</span>
```

### 条件语法（计划中）
```html
{{#if user.isAdmin}}
    <button>管理面板</button>
{{/if}}
```

### 循环语法（计划中）
```html
{{#each items}}
    <div class="item">{{name}}</div>
{{/each}}
```

## ⌨️ 键盘快捷键

### 布局控制
- `Ctrl + B` - 切换侧边栏显示/隐藏
- `Ctrl + Shift + T` - 切换浅色/深色主题
- `Ctrl + Shift + C` - 切换紧凑模式
- `Ctrl + Shift + L` - 显示布局设置面板

### 功能访问
- `Ctrl + M` - 打开菜单管理模态框
- `Ctrl + D` - 打开设备模拟器
- `Alt + 1-4` - 快速导航到对应菜单项
- `Esc` - 关闭所有打开的弹窗和面板

## 🔧 高级功能

### 事件系统

系统内置了完整的事件系统，支持组件间通信：

```javascript
// 监听组件加载完成事件
document.addEventListener('component:loaded', (e) => {
    const { componentName, element } = e.detail;
    console.log(`组件 ${componentName} 已加载`);
});

// 监听布局变更事件
document.addEventListener('layout:changed', (e) => {
    console.log('布局已变更:', e.detail);
});

// 触发自定义事件
BrainBaseApp.triggerEvent('custom:event', { data: 'value' });
```

### 通知系统

内置通知系统，支持多种类型的消息提示：

```javascript
// 显示不同类型的通知
BrainBaseApp.notify.show('操作成功！', 'success', 3000);
BrainBaseApp.notify.show('发生错误！', 'error', 5000);
BrainBaseApp.notify.show('警告信息', 'warning', 4000);
BrainBaseApp.notify.show('提示信息', 'info', 3000);
```

### 调试工具

在开发环境中，系统会自动启用调试工具：

```javascript
// 在浏览器控制台中使用
BrainBaseDebug.getInfo();        // 获取应用信息
BrainBaseDebug.clearData();      // 清除所有数据
BrainBaseDebug.reload();         // 重新加载页面
BrainBaseDebug.export();         // 导出设置数据
```

## 📱 响应式设计

系统内置响应式支持，自动适配不同设备：

### 断点定义
- **移动设备**: < 768px
- **平板设备**: 768px - 1024px  
- **桌面设备**: > 1024px

### 自适应特性
- 侧边栏在小屏幕设备上自动隐藏
- 菜单在移动端转换为全屏显示
- 设备模拟器支持多种主流设备尺寸

## 🔄 版本控制和更新

### 缓存机制
- 模板文件会被缓存以提升性能
- 可通过 `templateEngine.clearCache()` 清除缓存

### 更新检查
- 系统会在页面重新显示时检查更新
- 支持版本比较和自动更新提示

## 🚨 错误处理

### 全局错误捕获
系统会自动捕获和处理各种错误：

```javascript
// JavaScript 错误
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    // 显示用户友好的错误信息
});

// Promise 拒绝
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    // 显示错误通知
});
```

### 组件加载失败处理
```javascript
try {
    await componentLoader.loadComponent('header', '#headerContainer');
} catch (error) {
    console.error('组件加载失败:', error);
    // 显示备用内容或错误信息
}
```

## 📝 最佳实践

### 1. 组件设计
- 保持组件的单一职责
- 使用清晰的命名约定
- 添加适当的注释和文档

### 2. 模板数据
- 使用一致的数据结构
- 避免在模板中进行复杂的逻辑运算
- 提供默认值以防止错误

### 3. 性能优化
- 合理使用组件缓存
- 避免频繁的DOM操作
- 使用事件委托处理大量元素

### 4. 可维护性
- 保持代码结构清晰
- 使用版本控制管理变更
- 编写单元测试验证功能

## 🤝 贡献指南

### 开发环境设置
1. 克隆项目到本地
2. 使用 Live Server 或类似工具启动本地服务器
3. 访问 `example-page.html` 查看示例

### 代码规范
- 使用 UTF-8 编码
- 遵循现有的代码风格
- 添加必要的中文注释
- 确保响应式兼容性

### 提交变更
1. 创建功能分支
2. 进行充分测试
3. 更新相关文档
4. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 LICENSE 文件。

## 🆘 支持与反馈

如遇到问题或有改进建议，请：

1. 查看本文档的常见问题部分
2. 检查浏览器控制台的错误信息
3. 使用内置的调试工具进行诊断
4. 通过项目仓库提交 Issue

---

**BrainBase Template System** - 让前端开发更高效、更优雅！ 