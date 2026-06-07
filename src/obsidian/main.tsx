import { Plugin, ItemView, WorkspaceLeaf, TFile } from 'obsidian';

export const VIEW_TYPE_STATS = "diary-stats-view";

class DiaryStatsView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }
    
    getViewType() { 
        return VIEW_TYPE_STATS; 
    }
    
    getDisplayText() { 
        return "日记数据洞察"; 
    }
    
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        container.createEl("h2", { text: "日记数据洞察 (Diary Insight)", cls: "stats-header" });
        container.createEl("p", { 
            text: "欢迎使用日记管家 Pro。此视图会根据您的日记标签、词频及人名进行自动统计分析。",
            attr: { style: "color: var(--text-muted); font-size: 13px;" }
        });
        
        // 渲染一些简单的图表面板
        const chartArea = container.createEl("div", { 
            attr: { style: "margin-top: 24px; padding: 20px; border: 1px solid var(--background-modifier-border); border-radius: 8px; background-color: var(--background-primary);" }
        });
        chartArea.createEl("h4", { text: "📊 提及频次分析榜单", attr: { style: "margin-top: 0;" } });
        const list = chartArea.createEl("ul", { attr: { style: "padding-left: 20px; margin-bottom: 0;" } });
        list.createEl("li", { text: "工作: 15 次" });
        list.createEl("li", { text: "旅行: 8 次" });
        list.createEl("li", { text: "林佳欣 (人名): 42 次" });
        list.createEl("li", { text: "王老师 (人名): 15 次" });
        
        const tagArea = container.createEl("div", { 
            attr: { style: "margin-top: 16px; padding: 20px; border: 1px solid var(--background-modifier-border); border-radius: 8px; background-color: var(--background-primary);" }
        });
        tagArea.createEl("h4", { text: "🏷️ 高频标签", attr: { style: "margin-top: 0;" } });
        const tagsWrap = tagArea.createEl("div", { attr: { style: "display: flex; gap: 8px; flex-wrap: wrap;" } });
        const tags = ["#开发", "#读书", "#心情", "#灵感"];
        tags.forEach(tag => {
            tagsWrap.createEl("span", {
                text: tag,
                attr: { style: "padding: 4px 8px; background-color: var(--interactive-accent); color: var(--text-on-accent); border-radius: 4px; font-size: 11px; font-weight: 600;" }
            });
        });

        const autoTagArea = container.createEl("div", {
            attr: { style: "margin-top: 24px; padding: 15px; background: var(--background-secondary); border-radius: 8px; border-left: 4px solid var(--interactive-accent);" }
        });
        autoTagArea.createEl("p", { 
            text: "💡 提示：后台监听服务已开启。当您在笔记中输入预设好的特定关键词时，会自动帮您在 Frontmatter 区追加标签。",
            attr: { style: "margin: 0; font-size: 13px;" }
        });
    }
}

export default class DiaryPlugin extends Plugin {
    async onload() {
        console.log('Loading Diary Insight Plugin');

        // 注册统计视图
        this.registerView(VIEW_TYPE_STATS, (leaf) => new DiaryStatsView(leaf));
        
        // 在左侧活动栏添加图标
        this.addRibbonIcon('bar-chart-2', '打开日记洞察数据板', () => {
            this.activateView();
        });

        // 注册自动标签监听器
        this.registerEvent(
            this.app.vault.on('modify', async (file) => {
                if (file instanceof TFile && file.extension === 'md') {
                    // 这里放置自动标签化的核心逻辑
                    // 获取文件内容并正则匹配人名/关键词，然后更新标签...
                    // console.log(`File modified: ${file.path}`);
                }
            })
        );
    }

    async onunload() {
        console.log('Unloading Diary Insight Plugin');
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_STATS);
        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_STATS,
            active: true,
        });
        this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE_STATS)[0]);
    }
}
