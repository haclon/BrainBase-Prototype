/**
 * BrainBase - 主应用程序文件
 * 整合所有功能模块，提供统一的应用程序接口
 */

// 应用程序主类
class BrainBaseApplication {
    constructor() {
        this.templateEngine = null;
        this.componentLoader = null;
        this.layoutManager = null;
        this.notify = null;
        this.deviceSimulator = null;
        this.menuManager = null;
        this.pinManager = null;
        this.starManager = null;
        this.initialized = false;
    }

    /**
     * 初始化应用程序
     * @param {Object} config - 配置对象
     */
    async init(config = {}) {
        try {
            console.log('🚀 正在初始化 BrainBase 应用程序...');

            // 设置核心组件
            this.templateEngine = config.templateEngine || new BrainBaseCore.TemplateEngine();
            this.componentLoader = config.componentLoader || new BrainBaseCore.ComponentLoader(this.templateEngine);
            this.layoutManager = config.layoutManager || new BrainBaseCore.LayoutManager();

            // 初始化通知系统
            this.initNotificationSystem();

            // 初始化各功能模块
            await this.initModules();

            // 绑定全局事件
            this.bindGlobalEvents();

            // 设置全局键盘快捷键
            this.setupKeyboardShortcuts();

            // 初始化调试工具
            this.initDebugTools();

            this.initialized = true;
            console.log('✅ BrainBase 应用程序初始化完成');

            // 触发初始化完成事件
            this.triggerEvent('app:initialized', { app: this });

        } catch (error) {
            console.error('❌ 应用程序初始化失败:', error);
            this.notify?.show('应用程序初始化失败', 'error', 5000);
            throw error;
        }
    }

    /**
     * 初始化通知系统
     */
    initNotificationSystem() {
        this.notify = {
            container: null,
            
            init() {
                this.container = document.getElementById('notificationContainer');
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = 'notificationContainer';
                    this.container.className = 'notification-container';
                    document.body.appendChild(this.container);
                }
            },

            show(message, type = 'info', duration = 3000) {
                if (!this.container) this.init();

                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                
                const icons = {
                    success: 'fas fa-check-circle',
                    error: 'fas fa-times-circle',
                    warning: 'fas fa-exclamation-triangle',
                    info: 'fas fa-info-circle'
                };

                notification.innerHTML = `
                    <i class="${icons[type] || icons.info}"></i>
                    <span>${message}</span>
                    <button class="notification-close" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                this.container.appendChild(notification);

                // 添加显示动画
                setTimeout(() => notification.classList.add('show'), 10);

                // 自动移除
                if (duration > 0) {
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => notification.remove(), 300);
                    }, duration);
                }

                return notification;
            }
        };

        this.notify.init();
    }

    /**
     * 初始化功能模块
     */
    async initModules() {
        // 初始化设备模拟器
        if (window.DeviceSimulator) {
            this.deviceSimulator = new DeviceSimulator();
        }

        // 初始化菜单管理器
        if (window.MenuManagement) {
            this.menuManager = new MenuManagement();
        }

        // 初始化图钉管理器
        if (window.PinManager) {
            this.pinManager = new PinManager();
        }

        // 初始化星标管理器
        if (window.StarManager) {
            this.starManager = new StarManager();
        }

        // 绑定模块间通信
        this.setupModuleCommunication();
    }

    /**
     * 设置模块间通信
     */
    setupModuleCommunication() {
        // 监听组件加载完成事件
        document.addEventListener('component:loaded', (e) => {
            const { componentName, element } = e.detail;
            
            // 当侧边栏加载完成时，初始化相关功能
            if (componentName === 'sidebar') {
                this.pinManager?.init();
                this.starManager?.init();
            }
            
            // 当头部加载完成时，初始化相关功能
            if (componentName === 'header') {
                this.deviceSimulator?.init();
                this.menuManager?.init();
            }
        });

        // 监听布局变更事件
        document.addEventListener('layout:changed', (e) => {
            this.deviceSimulator?.handleLayoutChange?.(e.detail);
        });
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听窗口大小变化
        window.addEventListener('resize', BrainBaseCore.Utils.throttle(() => {
            this.handleWindowResize();
        }, 250));

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.notify.show('网络连接已恢复', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            this.notify.show('网络连接已断开', 'warning', 5000);
        });

        // 监听错误事件
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.notify.show('发生了一个错误，请刷新页面重试', 'error', 5000);
        });

        // 监听未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise拒绝:', e.reason);
            this.notify.show('操作失败，请重试', 'error', 3000);
        });
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 检查是否按下了修饰键
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            const isAlt = e.altKey;

            // 阻止某些快捷键的默认行为
            if (isCtrl) {
                switch (e.key.toLowerCase()) {
                    case 'b': // Ctrl+B - 切换侧边栏
                        e.preventDefault();
                        this.layoutManager.toggleSidebar();
                        break;
                    
                    case 'd': // Ctrl+D - 打开设备模拟器
                        e.preventDefault();
                        this.deviceSimulator?.toggle();
                        break;
                    
                    case 'm': // Ctrl+M - 打开菜单管理
                        e.preventDefault();
                        this.menuManager?.showModal();
                        break;
                }
            }

            // Ctrl+Shift 组合键
            if (isCtrl && isShift) {
                switch (e.key.toLowerCase()) {
                    case 't': // Ctrl+Shift+T - 切换主题
                        e.preventDefault();
                        this.layoutManager.toggleTheme();
                        break;
                    
                    case 'c': // Ctrl+Shift+C - 切换紧凑模式
                        e.preventDefault();
                        this.layoutManager.toggleCompactMode();
                        break;
                    
                    case 'l': // Ctrl+Shift+L - 显示布局设置
                        e.preventDefault();
                        this.layoutManager.showSettingsPanel();
                        break;
                }
            }

            // Alt 组合键
            if (isAlt) {
                switch (e.key.toLowerCase()) {
                    case '1': // Alt+1 - 跳转到仪表盘
                    case '2': // Alt+2 - 跳转到用户管理
                    case '3': // Alt+3 - 跳转到角色管理
                    case '4': // Alt+4 - 跳转到权限配置
                        e.preventDefault();
                        this.navigateByShortcut(parseInt(e.key));
                        break;
                }
            }

            // Esc 键 - 关闭所有弹窗
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * 通过快捷键导航
     * @param {number} index - 导航索引
     */
    navigateByShortcut(index) {
        const navItems = document.querySelectorAll('.gitee-nav-item');
        if (navItems[index - 1]) {
            navItems[index - 1].click();
            this.notify.show(`已跳转到: ${navItems[index - 1].textContent.trim()}`, 'info', 1500);
        }
    }

    /**
     * 关闭所有模态框
     */
    closeAllModals() {
        // 关闭菜单管理模态框
        const menuModal = document.getElementById('menuManagementModal');
        if (menuModal && menuModal.classList.contains('active')) {
            this.menuManager?.hideModal();
        }

        // 关闭设备模拟器
        if (this.deviceSimulator?.isActive) {
            this.deviceSimulator.close();
        }

        // 关闭布局设置面板
        const layoutPanel = document.querySelector('.layout-settings-panel');
        if (layoutPanel) {
            layoutPanel.remove();
        }

        // 关闭下拉菜单
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (dropdownMenu && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        // 更新设备模拟器尺寸
        this.deviceSimulator?.updateSize?.();
        
        // 触发布局变更事件
        this.triggerEvent('layout:resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面已隐藏');
        } else {
            console.log('页面已显示');
            // 页面重新显示时，检查是否有更新
            this.checkForUpdates();
        }
    }

    /**
     * 检查应用更新
     */
    async checkForUpdates() {
        try {
            // 这里可以实现版本检查逻辑
            // 比如检查模板文件是否有更新
            const lastUpdate = localStorage.getItem('brainbase-last-update');
            const now = Date.now();
            
            // 如果超过一小时没有检查更新
            if (!lastUpdate || now - parseInt(lastUpdate) > 3600000) {
                localStorage.setItem('brainbase-last-update', now.toString());
                console.log('检查应用更新...');
            }
        } catch (error) {
            console.warn('检查更新失败:', error);
        }
    }

    /**
     * 初始化调试工具
     */
    initDebugTools() {
        // 只在开发环境中启用调试工具
        if (this.isDevelopment()) {
            window.BrainBaseDebug = {
                app: this,
                getInfo: () => ({
                    initialized: this.initialized,
                    modules: {
                        templateEngine: !!this.templateEngine,
                        componentLoader: !!this.componentLoader,
                        layoutManager: !!this.layoutManager,
                        deviceSimulator: !!this.deviceSimulator,
                        menuManager: !!this.menuManager,
                        pinManager: !!this.pinManager,
                        starManager: !!this.starManager
                    },
                    settings: {
                        layout: this.layoutManager?.settings,
                        pins: this.pinManager?.isEnabled(),
                        stars: this.starManager?.getStarredItems()
                    }
                }),
                reload: () => location.reload(),
                clearData: () => {
                    localStorage.clear();
                    this.notify.show('所有数据已清除，即将刷新页面', 'warning', 2000);
                    setTimeout(() => location.reload(), 2000);
                },
                simulate: (device) => {
                    this.deviceSimulator?.simulateDevice(device);
                },
                export: () => {
                    const data = {
                        layout: this.layoutManager?.settings,
                        pins: localStorage.getItem('pins-enabled'),
                        stars: localStorage.getItem('starred-menu-items'),
                        timestamp: new Date().toISOString()
                    };
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: 'application/json'
                    });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `brainbase-settings-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    this.notify.show('设置已导出', 'success', 2000);
                }
            };

            console.log('🛠️ 调试工具已启用，使用 BrainBaseDebug 访问');
        }
    }

    /**
     * 检查是否为开发环境
     * @returns {boolean}
     */
    isDevelopment() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.search.includes('debug=true');
    }

    /**
     * 触发自定义事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     */
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * 重新加载组件
     * @param {string} componentName - 组件名称
     */
    async reloadComponent(componentName) {
        try {
            const targetSelector = componentName === 'header' ? '#headerContainer' : '#sidebarContainer';
            await this.componentLoader.reloadComponent(componentName, targetSelector);
            this.notify.show(`${componentName} 组件已重新加载`, 'success', 2000);
        } catch (error) {
            console.error(`重新加载 ${componentName} 组件失败:`, error);
            this.notify.show(`重新加载 ${componentName} 组件失败`, 'error', 3000);
        }
    }

    /**
     * 获取应用状态
     * @returns {Object} 应用状态信息
     */
    getStatus() {
        return {
            initialized: this.initialized,
            modules: {
                templateEngine: !!this.templateEngine,
                componentLoader: !!this.componentLoader,
                layoutManager: !!this.layoutManager,
                deviceSimulator: !!this.deviceSimulator,
                menuManager: !!this.menuManager,
                pinManager: !!this.pinManager,
                starManager: !!this.starManager
            },
            performance: {
                loadTime: performance.now(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576)
                } : null
            }
        };
    }

    /**
     * 销毁应用程序
     */
    destroy() {
        console.log('🔥 正在销毁 BrainBase 应用程序...');
        
        // 清理事件监听器
        window.removeEventListener('resize', this.handleWindowResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 销毁各模块
        this.deviceSimulator?.destroy?.();
        this.menuManager?.destroy?.();
        this.pinManager?.destroy?.();
        this.starManager?.destroy?.();
        
        // 清空引用
        this.templateEngine = null;
        this.componentLoader = null;
        this.layoutManager = null;
        this.notify = null;
        this.deviceSimulator = null;
        this.menuManager = null;
        this.pinManager = null;
        this.starManager = null;
        
        this.initialized = false;
        console.log('✅ BrainBase 应用程序已销毁');
    }
}

// 创建全局应用实例
window.BrainBaseApp = new BrainBaseApplication();

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.BrainBaseApp) {
        window.BrainBaseApp.destroy();
    }
});

console.log('📦 BrainBase 应用程序模块已加载'); 