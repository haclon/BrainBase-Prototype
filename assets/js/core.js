/**
 * BrainBase - 核心JavaScript功能
 * 包含模板引擎、组件加载器和核心工具类
 */

// 模板引擎类
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.components = new Map();
        this.data = {};
    }

    /**
     * 设置模板数据
     * @param {Object} data - 模板数据
     */
    setData(data) {
        this.data = { ...this.data, ...data };
    }

    /**
     * 渲染模板字符串
     * @param {string} template - 模板字符串
     * @param {Object} data - 数据对象
     * @returns {string} 渲染后的字符串
     */
    render(template, data = {}) {
        const mergedData = { ...this.data, ...data };
        
        // 处理 {{变量}} 语法
        return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
            expression = expression.trim();
            
            // 处理简单的条件语法 {{#if variable}}...{{/if}}
            if (expression.startsWith('#if ')) {
                return this.handleCondition(expression, template, mergedData);
            }
            
            // 处理循环语法 {{#each array}}...{{/each}}
            if (expression.startsWith('#each ')) {
                return this.handleLoop(expression, template, mergedData);
            }
            
            // 处理普通变量替换
            return this.getValue(expression, mergedData);
        });
    }

    /**
     * 获取对象属性值，支持点语法
     * @param {string} path - 属性路径
     * @param {Object} data - 数据对象
     * @returns {any} 属性值
     */
    getValue(path, data) {
        try {
            return path.split('.').reduce((obj, key) => obj && obj[key], data) || '';
        } catch (e) {
            console.warn(`模板变量 ${path} 未找到`);
            return '';
        }
    }

    /**
     * 加载并缓存模板文件
     * @param {string} templatePath - 模板文件路径
     * @returns {Promise<string>} 模板内容
     */
    async loadTemplate(templatePath) {
        if (this.templates.has(templatePath)) {
            return this.templates.get(templatePath);
        }

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`加载模板失败: ${templatePath} (${response.status})`);
            }
            
            const template = await response.text();
            this.templates.set(templatePath, template);
            return template;
        } catch (error) {
            console.error('模板加载失败:', error);
            return '';
        }
    }

    /**
     * 渲染模板文件
     * @param {string} templatePath - 模板文件路径
     * @param {Object} data - 数据对象
     * @returns {Promise<string>} 渲染后的HTML
     */
    async renderTemplate(templatePath, data = {}) {
        const template = await this.loadTemplate(templatePath);
        return this.render(template, data);
    }

    /**
     * 清除模板缓存
     */
    clearCache() {
        this.templates.clear();
        this.components.clear();
    }
}

// 组件加载器类
class ComponentLoader {
    constructor(templateEngine) {
        this.templateEngine = templateEngine;
        this.loadedComponents = new Set();
    }

    /**
     * 加载单个组件
     * @param {string} componentName - 组件名称
     * @param {string} targetSelector - 目标选择器
     * @param {Object} data - 组件数据
     * @returns {Promise<void>}
     */
    async loadComponent(componentName, targetSelector, data = {}) {
        try {
            const componentPath = `components/${componentName}.html`;
            const html = await this.templateEngine.renderTemplate(componentPath, data);
            
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;
                this.loadedComponents.add(componentName);
                
                // 触发组件加载完成事件
                this.triggerComponentLoaded(componentName, targetElement);
                
                console.log(`✅ 组件 ${componentName} 加载完成`);
            } else {
                console.warn(`⚠️ 目标元素 ${targetSelector} 未找到`);
            }
        } catch (error) {
            console.error(`❌ 组件 ${componentName} 加载失败:`, error);
        }
    }

    /**
     * 批量加载组件
     * @param {Array} components - 组件配置数组
     */
    async loadComponents(components) {
        const loadPromises = components.map(({ name, target, data }) => 
            this.loadComponent(name, target, data)
        );
        
        await Promise.allSettled(loadPromises);
        console.log('📦 所有组件加载完成');
    }

    /**
     * 触发组件加载完成事件
     * @param {string} componentName - 组件名称
     * @param {Element} element - 组件元素
     */
    triggerComponentLoaded(componentName, element) {
        const event = new CustomEvent('component:loaded', {
            detail: { componentName, element }
        });
        document.dispatchEvent(event);
    }

    /**
     * 重新加载组件
     * @param {string} componentName - 组件名称
     * @param {string} targetSelector - 目标选择器
     * @param {Object} data - 新数据
     */
    async reloadComponent(componentName, targetSelector, data = {}) {
        console.log(`🔄 重新加载组件: ${componentName}`);
        await this.loadComponent(componentName, targetSelector, data);
    }
}

// 布局管理器类
class LayoutManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    /**
     * 初始化布局管理器
     */
    init() {
        this.applySettings();
        this.bindEvents();
        console.log('🎨 布局管理器已初始化');
    }

    /**
     * 加载布局设置
     * @returns {Object} 布局设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('brainbase-layout-settings');
            return saved ? JSON.parse(saved) : {
                sidebarVisible: true,
                sidebarWidth: 80,
                compactMode: false,
                theme: 'light'
            };
        } catch (e) {
            console.error('加载布局设置失败:', e);
            return {
                sidebarVisible: true,
                sidebarWidth: 80,
                compactMode: false,
                theme: 'light'
            };
        }
    }

    /**
     * 保存布局设置
     */
    saveSettings() {
        try {
            localStorage.setItem('brainbase-layout-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('保存布局设置失败:', e);
        }
    }

    /**
     * 应用布局设置
     */
    applySettings() {
        const { sidebarVisible, sidebarWidth, compactMode, theme } = this.settings;
        
        // 应用侧边栏可见性
        this.setSidebarVisibility(sidebarVisible);
        
        // 应用侧边栏宽度
        this.setSidebarWidth(sidebarWidth);
        
        // 应用紧凑模式
        this.setCompactMode(compactMode);
        
        // 应用主题
        this.setTheme(theme);
    }

    /**
     * 设置侧边栏可见性
     * @param {boolean} visible - 是否可见
     */
    setSidebarVisibility(visible) {
        const sidebar = document.querySelector('.gitee-sidebar');
        const content = document.querySelector('.gitee-content');
        
        if (sidebar && content) {
            if (visible) {
                sidebar.classList.remove('sidebar-hidden');
                content.classList.remove('sidebar-hidden');
            } else {
                sidebar.classList.add('sidebar-hidden');
                content.classList.add('sidebar-hidden');
            }
            
            this.settings.sidebarVisible = visible;
            this.saveSettings();
        }
    }

    /**
     * 设置侧边栏宽度
     * @param {number} width - 宽度（像素）
     */
    setSidebarWidth(width) {
        const sidebar = document.querySelector('.gitee-sidebar');
        const content = document.querySelector('.gitee-content');
        
        if (sidebar && content) {
            // 更新CSS变量
            document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
            
            // 如果不是悬停状态，直接设置宽度
            if (!sidebar.matches(':hover')) {
                sidebar.style.width = `${width}px`;
                content.style.marginLeft = `${width}px`;
                content.style.width = `calc(100% - ${width}px)`;
            }
            
            this.settings.sidebarWidth = width;
            this.saveSettings();
        }
    }

    /**
     * 设置紧凑模式
     * @param {boolean} compact - 是否启用紧凑模式
     */
    setCompactMode(compact) {
        const body = document.body;
        
        if (compact) {
            body.classList.add('layout-compact');
        } else {
            body.classList.remove('layout-compact');
        }
        
        this.settings.compactMode = compact;
        this.saveSettings();
    }

    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light' | 'dark')
     */
    setTheme(theme) {
        const body = document.body;
        
        // 移除所有主题类
        body.classList.remove('theme-light', 'theme-dark');
        
        // 添加新主题类
        body.classList.add(`theme-${theme}`);
        
        this.settings.theme = theme;
        this.saveSettings();
    }

    /**
     * 切换侧边栏可见性
     */
    toggleSidebar() {
        this.setSidebarVisibility(!this.settings.sidebarVisible);
    }

    /**
     * 切换紧凑模式
     */
    toggleCompactMode() {
        this.setCompactMode(!this.settings.compactMode);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 监听键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 在小屏幕上自动隐藏侧边栏
        if (window.innerWidth < 768 && this.settings.sidebarVisible) {
            this.setSidebarVisibility(false);
        }
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeydown(e) {
        // Ctrl+B 切换侧边栏
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        // Ctrl+Shift+T 切换主题
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    /**
     * 创建布局设置界面
     * @returns {HTMLElement} 设置界面元素
     */
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'layout-settings-panel';
        panel.innerHTML = `
            <div class="layout-settings-header">
                <h3><i class="fas fa-layout"></i> 布局设置</h3>
                <button class="close-btn" data-action="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="layout-settings-body">
                <div class="setting-group">
                    <label>
                        <span>侧边栏显示</span>
                        <input type="checkbox" ${this.settings.sidebarVisible ? 'checked' : ''} 
                               data-setting="sidebarVisible">
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <span>侧边栏宽度</span>
                        <input type="range" min="60" max="300" value="${this.settings.sidebarWidth}" 
                               data-setting="sidebarWidth">
                        <span class="value">${this.settings.sidebarWidth}px</span>
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <span>紧凑模式</span>
                        <input type="checkbox" ${this.settings.compactMode ? 'checked' : ''} 
                               data-setting="compactMode">
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <span>主题</span>
                        <select data-setting="theme">
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>浅色</option>
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>深色</option>
                        </select>
                    </label>
                </div>
                <div class="setting-actions">
                    <button class="btn btn-outline" data-action="reset">重置设置</button>
                    <button class="btn gitee-btn" data-action="save">保存设置</button>
                </div>
            </div>
        `;

        // 绑定设置面板事件
        this.bindSettingsPanelEvents(panel);
        
        return panel;
    }

    /**
     * 绑定设置面板事件
     * @param {HTMLElement} panel - 设置面板元素
     */
    bindSettingsPanelEvents(panel) {
        panel.addEventListener('change', (e) => {
            const setting = e.target.dataset.setting;
            if (!setting) return;

            let value = e.target.value;
            if (e.target.type === 'checkbox') {
                value = e.target.checked;
            } else if (e.target.type === 'range') {
                value = parseInt(value);
                // 更新显示值
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan) {
                    valueSpan.textContent = `${value}px`;
                }
            }

            // 应用设置
            switch (setting) {
                case 'sidebarVisible':
                    this.setSidebarVisibility(value);
                    break;
                case 'sidebarWidth':
                    this.setSidebarWidth(value);
                    break;
                case 'compactMode':
                    this.setCompactMode(value);
                    break;
                case 'theme':
                    this.setTheme(value);
                    break;
            }
        });

        panel.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'close':
                    panel.remove();
                    break;
                case 'reset':
                    this.resetSettings();
                    panel.remove();
                    break;
                case 'save':
                    if (window.BrainBase && window.BrainBase.notify) {
                        BrainBase.notify.show('布局设置已保存', 'success', 2000);
                    }
                    panel.remove();
                    break;
            }
        });
    }

    /**
     * 重置布局设置
     */
    resetSettings() {
        this.settings = {
            sidebarVisible: true,
            sidebarWidth: 80,
            compactMode: false,
            theme: 'light'
        };
        
        this.applySettings();
        
        if (window.BrainBase && window.BrainBase.notify) {
            BrainBase.notify.show('布局设置已重置', 'success', 2000);
        }
    }

    /**
     * 显示布局设置面板
     */
    showSettingsPanel() {
        // 移除已存在的面板
        const existingPanel = document.querySelector('.layout-settings-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // 创建新面板
        const panel = this.createSettingsPanel();
        document.body.appendChild(panel);

        // 添加显示动画
        setTimeout(() => {
            panel.classList.add('show');
        }, 10);
    }
}

// 工具函数
const Utils = {
    /**
     * 深度合并对象
     * @param {Object} target - 目标对象
     * @param {...Object} sources - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    },

    /**
     * 检查是否为对象
     * @param {any} item - 要检查的项
     * @returns {boolean} 是否为对象
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 生成UUID
     * @returns {string} UUID字符串
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// 导出核心对象
window.BrainBaseCore = {
    TemplateEngine,
    ComponentLoader,
    LayoutManager,
    Utils
};

console.log('🚀 BrainBase 核心模块已加载'); 