import { LitElement, html, css } from "lit";

// import { LitElement, html, css } from "https://unpkg.com/lit@3.3.1/index.js?module";

// 主卡片：Lunar Info Card
const LUNAR_CARD_VERSION = "v0.0.5-lit";

console.log(
  `%cLunar Info Card ${LUNAR_CARD_VERSION} Fixed`,
  "color: #1976d2; font-weight: bold; background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 2px 6px;"
);

class LunarInfoCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  constructor() {
    super();
    this._templateCache = new Map();
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      /* 开启容器查询，让卡片根据自身宽度缩放字体 */
      container-type: inline-size;
    }

    ha-card {
      height: 100%;
      padding: 12px;
      box-sizing: border-box;
      background-color: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      display: flex;
      flex-direction: column;
    }

    /* 核心布局引擎：命名网格区域 */
    .card-container {
      display: grid;
      flex: 1;
      gap: 4px;
      min-height: 0;
      grid-template-columns: repeat(4, 1fr);
      /* 前四行 1.5倍高度，后四行 1倍高度 */
      grid-template-rows: repeat(4, 1.5fr) repeat(4, 1fr);
      grid-template-areas:
        "lunar wuxing    wuxing    wuxing"
        "lunar chongsha   chongsha   chongsha"
        "lunar pengzu     pengzu     pengzu"
        "lunar xishen     fushen     caishen"
        "yi    yi         yi         yi"
        "ji    ji         ji         ji"
        "jishen jishen    jishen     jishen"
        "xiongsha xiongsha xiongsha   xiongsha";
    }

    /* --- 区域 A: 左侧纵向农历 --- */
    .section-lunar {
      grid-area: lunar;
      display: grid;
      grid-template-columns: 1fr 2fr;
      align-items: center;
      justify-items: center;
      border-inline-end: 1px solid var(--divider-color, rgba(0,0,0,0.1));
      border-block-end: 1px solid var(--divider-color, rgba(0,0,0,0.1));
      padding-inline-end: 4px;
    }

    .section-lunar .name {
      writing-mode: vertical-lr;
      font-weight: 900;
      font-size: clamp(1.4em, 10cqw, 2em);
      letter-spacing: 0.2em;
      color: var(--primary-color);
    }
    .section-lunar .label {
      writing-mode: vertical-lr;
      font-size: clamp(0.85em, 5cqw, 1.1em);
      letter-spacing: 0.1em;
      line-height: 1.2;
      font-weight: 400;
    }

    /* --- 布局模式 --- */
    /* 我们通过选择对应的 grid-area 来添加样式 */
    [style*="grid-area: xishen"],
    [style*="grid-area: fushen"],
    [style*="grid-area: caishen"] {
      border-block-start: 1px solid var(--divider-color, rgba(0,0,0,0.1)); /* 上分割线 */
      border-block-end: 1px solid var(--divider-color, rgba(0,0,0,0.1));   /* 下分割线 */
      height: 100%;
      box-sizing: border-box;
    }

    /* 基础单元格：居中对齐 */
    .cell {
      display: grid;
      align-items: center;
      min-width: 0;
    }

    /* 横向两列布局 (用于顶部三行) */
    .layout-row {
      grid-template-columns: 1fr 2fr;
      align-items: center;
    }

    /* 纵向堆叠布局 (用于三个神位) */
    .layout-stack {
      grid-template-rows: auto auto;
      justify-items: center;
      text-align: center;
      padding-block: 4px;
    }

    /* 底部条状布局 (宜忌吉凶) */
    .layout-bar {
      grid-template-columns: 50px 1fr;
      gap: 8px;
    }

    /* --- 元素样式 --- */
    .title {
      font-weight: bold;
      font-size: clamp(0.85rem, 4.5cqw, 1.2rem);
      justify-self: center;
    }

    /* 单行截断样式 */
    .content-single {
      font-size: clamp(0.8rem, 4cqw, 1.05rem);
      font-weight: 300;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 多行换行样式 (核心优化) */
    .content-wrap {
      font-size: clamp(0.8rem, 4cqw, 1.05rem);
      font-weight: 300;
      line-height: 1.3;
      white-space: normal;
      word-break: break-all;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* 限制2行，防止破坏整体高度 */
      overflow: hidden;
    }

    /* 宜忌圆圈：Flexbox 绝对居中 */
    .circle {
      width: 1.8em;
      height: 1.8em;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: bold;
      font-size: 1.1em;
      justify-self: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .bg-green { background-color: var(--success-color, #4caf50); }
    .bg-red { background-color: var(--error-color, #f44336); }

    /* 适配极窄屏幕 */
    @container (max-width: 280px) {
      ha-card { padding: 6px; }
      .card-container { gap: 2px; }
      .layout-bar { grid-template-columns: 40px 1fr; gap: 4px; }
    }
  `;

  // 高级模板解析引擎 (带缓存)
  _evalTemplate(key, template) {
    if (!template) return "";
    try {
      let fn = this._templateCache.get(key);
      if (!fn) {
        const code = template
          .replace(/^\[\[\[\s*|\s*\]\]\]$/g, "")
          .replace(/\$\{entity\}/g, this.config.entity);
        fn = new Function("states", `try { ${code} } catch(e) { return ""; }`);
        this._templateCache.set(key, fn);
      }
      return fn(this.hass.states) || "";
    } catch (e) {
      console.warn(`Template error in [${key}]:`, e);
      return "";
    }
  }

  render() {
    const entity = this.config.entity;
    const stateObj = this.hass?.states?.[entity];

    if (!stateObj) {
      return html`<ha-card style="color:red; padding:16px;">未找到实体: ${entity}</ha-card>`;
    }

    // 合并配置与默认字段
    const fields = this.config.customize && this.config.fields
      ? { ...LunarInfoCard.defaultFields(), ...this.config.fields }
      : LunarInfoCard.defaultFields();

    const data = {};
    for (const key in fields) {
      data[key] = this._evalTemplate(key, fields[key]);
    }

    return html`
      <ha-card>
        <div class="card-container">
          <!-- Area: 左侧核心农历 -->
          <div class="section-lunar">
            <div class="name">农历${data["农历"]}</div>
            <div class="label">${data["天干地支"]} ${data["星期"]}</div>
          </div>

          <!-- Area: 顶部三行信息 -->
          ${this._renderCell("wuxing", "layout-row", "五行", data["建除日"])}
          ${this._renderCell("chongsha", "layout-row", "冲煞", data["冲煞"])}
          ${this._renderCell("pengzu", "layout-row", "彭祖", html`${data["彭祖干"]}<br>${data["彭祖支"]}`)}

          <!-- Area: 三个方位神 -->
          ${this._renderCell("xishen", "layout-stack", "喜神", data["喜神"])}
          ${this._renderCell("fushen", "layout-stack", "福神", data["福神"])}
          ${this._renderCell("caishen", "layout-stack", "财神", data["财神"])}

          <!-- Area: 宜忌吉凶 (支持圆圈和换行) -->
          ${this._renderCircleCell("yi", "宜", data["宜"], "bg-green")}
          ${this._renderCircleCell("ji", "忌", data["忌"], "bg-red")}
          ${this._renderCell("jishen", "layout-bar", "吉神", data["吉神"], true)}
          ${this._renderCell("xiongsha", "layout-bar", "凶煞", data["凶煞"], true)}
        </div>
      </ha-card>
    `;
  }

  // 渲染函数：通用单元格
  _renderCell(area, layout, name, value, canWrap = false) {
    return html`
      <div class="cell ${layout}" style="grid-area: ${area};">
        <div class="title">${name}</div>
        <div class="${canWrap ? 'content-wrap' : 'content-single'}" title="${typeof value === 'string' ? value : ''}">
          ${value}
        </div>
      </div>
    `;
  }

  // 渲染函数：宜忌圆圈单元格
  _renderCircleCell(area, name, value, colorClass) {
    return html`
      <div class="cell layout-bar" style="grid-area: ${area};">
        <div class="circle ${colorClass}">${name}</div>
        <div class="content-wrap" title="${value}">${value}</div>
      </div>
    `;
  }

  // 默认字段映射逻辑
  static defaultFields() {
    return {
      农历: `[[[ return states['\${entity}'].state ]]]`,
      天干地支: `[[[ return states['\${entity}'].attributes.天干地支 || ''; ]]]`,
      星期: `[[[ return states['\${entity}'].attributes.星期 || ''; ]]]`,
      建除日: `[[[ return states['\${entity}'].attributes.建除日 || ''; ]]]`,
      冲煞: `[[[ return states['\${entity}'].attributes.冲煞 || ''; ]]]`,
      彭祖干: `[[[ return states['\${entity}'].attributes.彭祖干 || ''; ]]]`,
      彭祖支: `[[[ return states['\${entity}'].attributes.彭祖支 || ''; ]]]`,
      喜神: `[[[ return states['\${entity}'].attributes.吉神方位?.喜神 || ''; ]]]`,
      福神: `[[[ return states['\${entity}'].attributes.吉神方位?.福神 || ''; ]]]`,
      财神: `[[[ return states['\${entity}'].attributes.吉神方位?.财神 || ''; ]]]`,
      宜: `[[[ return states['\${entity}'].attributes.宜 || ''; ]]]`,
      忌: `[[[ return states['\${entity}'].attributes.忌 || ''; ]]]`,
      吉神: `[[[ return states['\${entity}'].attributes.吉神 || ''; ]]]`,
      凶煞: `[[[ return states['\${entity}'].attributes.凶煞 || ''; ]]]`,
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("请设置 entity 实体 ID");
    this.config = { ...config };
    this._templateCache.clear();
  }

getGridOptions() { return { rows: 8, columns: 9 }; }

  static getStubConfig() {
    return { entity: "sensor.tianyuan_nong_li_lunar_calendar" };
  }

  static async getConfigElement() {
    return document.createElement("lunar-info-card-editor");
  }
}

customElements.define("lunar-info-card", LunarInfoCard);

// 编辑器：Lunar Info Card Editor
class LunarInfoCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
  };

  setConfig(config) {
    this._config = { customize: false, ...config };
    if (this._config.customize && !this._config.fields) {
      this._config = { ...this._config, fields: LunarInfoCard.defaultFields() };
    }
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const newConfig = ev.detail.value;
    if (!newConfig.customize) {
      delete newConfig.customize;
      delete newConfig.fields;
    }
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  render() {
    if (!this.hass) return html``;

    const fieldKeys = ["农历","天干地支","星期","建除日","冲煞","彭祖干","彭祖支","喜神","福神","财神","宜","忌","吉神","凶煞"];
    const schema = [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      { name: "customize", selector: { boolean: {} } },
    ];

    if (this._config?.customize) {
      schema.push({
        name: "fields",
        type: "expandable",
        icon: "mdi:calendar-edit",
        schema: fieldKeys.map((key) => ({
          name: key,
          selector: { template: {} },
        })),
      });
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(s) => {
          const labels = { entity: "选择实体", customize: "开启高级模板自定义", fields: "自定义字段" };
          return labels[s.name] || s.name;
        }}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("lunar-info-card-editor", LunarInfoCardEditor);

// 注册卡片
window.customCards = window.customCards || [];
window.customCards.push({
  type: "lunar-info-card",
  name: "Lunar Info Card",
  preview: true,
  description: "基于 TianYuan Calendar 的专业农历信息卡片",
  documentationURL: "https://github.com/hzonz/lunar-info-card",
});
