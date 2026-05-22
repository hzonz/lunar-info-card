import { LitElement, html, css } from "lit";

// import { LitElement, html, css } from "https://unpkg.com/lit@3.3.1/index.js?module";

// 主卡片：Lunar Info Card
const LUNAR_CARD_VERSION = "v0.0.3-lit";

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
      --lunar-font-size: clamp(1.8em, 2.1em, 2.5em);
      --lunar-lunar-size: clamp(0.9em, 1.1em, 1.2em);
      --lunar-title-size: clamp(0.85em, 1.1em, 1.3em);
      --lunar-label-size: clamp(0.85rem, 1.1em, 1.3rem);
    }
    ha-card {
      padding: 12px;
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .card-container {
      display: grid;
      grid-template-areas:
        "a b b b"
        "a c c c"
        "a d d d"
        "a e f g"
        "h h h h"
        "i i i i"
        "j j j j"
        "k k k k";
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1.5fr) repeat(4, 1fr);
      gap: 4px;
      height: 100%;
    }
    
    .lunar { grid-area: a; display: grid; grid-template-areas: "n l"; grid-template-columns: 1fr 2fr; }
    .lunar .name { 
      writing-mode: vertical-lr; 
      font-weight: bold; 
      font-size: var(--lunar-font-size); 
      letter-spacing: 0.3em; 
      color: var(--primary-color);
      align-self: center;
      justify-self: center;
    }
    .lunar .label { 
      writing-mode: vertical-lr; 
      font-size: var(--lunar-lunar-size); 
      letter-spacing: 0.2em; 
      align-self: center;
      justify-self: center;
      line-height: 1.2;
    }

    .grid-a { display: grid; grid-template-areas: "n l"; grid-template-columns: 1fr 2fr; align-items: center; }
    .grid-b { display: grid; align-self: center; justify-items: start; grid-template-areas: "n" "l"; }
    
    /* 重点修正：layout c 容器（宜忌吉凶） */
    .grid-c { 
      display: grid; 
      grid-template-areas: "n l"; 
      grid-template-columns: 50px 1fr; 
      align-items: center;
      min-height: 0; /* 防止内容撑开容器 */
    }

    .grid-b .label { font-size: var(--lunar-label-size); justify-self: center; }
    
    .name { 
      font-weight: bold; 
      font-size: var(--lunar-title-size); 
      justify-self: center; 
      align-self: center; 
    }
    
    .label { 
      font-size: var(--lunar-label-size); 
      align-self: center; 
      font-weight: 300;
      overflow: hidden; 
      text-overflow: ellipsis; 
      white-space: nowrap; /* 普通单行内容不换行 */
    }

    /* 重点修正：自动换行逻辑 */
    .label-block {
      font-size: var(--lunar-label-size);
      align-self: center;
      font-weight: 300;
      line-height: 1.3;
      white-space: normal;   /* 允许换行 */
      word-break: break-all; /* 强制在单词内断行，适合显示大量神煞文字 */
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* 限制最大显示2行，防止撑破卡片。如果想显示全部，可以设为更高或删除此行 */
    }

    .circle { 
      width: 1.8em; 
      height: 1.8em; 
      border-radius: 50%; 
      display: flex;
      align-items: center;
      justify-content: center;
      justify-self: center; 
      align-self: center; 
      color: #fff; 
      font-size: 1.1em; 
      font-weight: bold;
      line-height: 1;
      flex-shrink: 0;
    }
    .circle.green { background-color: var(--success-color, #4caf50); }
    .circle.red { background-color: var(--error-color, #f44336); }
  `;

  setConfig(config) {
    if (!config.entity) throw new Error("请设置 entity");
    this.config = { ...config };
    this._templateCache.clear();
  }

  static defaultFields() {
    return {
      农历: `[[[ return states['\${entity}'].state ]]]`,
      天干地支: `[[[ return states['\${entity}'].attributes.lunar?.['天干地支'] || ''; ]]]`,
      星期: `[[[ return states['\${entity}'].attributes.lunar?.星期 || ''; ]]]`,
      建除日: `[[[ return states['\${entity}'].attributes.lunar?.建除日 || ''; ]]]`,
      冲煞: `[[[ return states['\${entity}'].attributes.lunar?.冲煞 || ''; ]]]`,
      彭祖干: `[[[ return states['\${entity}'].attributes.lunar?.['彭祖干'] || ''; ]]]`,
      彭祖支: `[[[ return states['\${entity}'].attributes.lunar?.['彭祖支'] || ''; ]]]`,
      喜神: `[[[ return states['\${entity}'].attributes.lunar?.吉神方位?.喜神 || ''; ]]]`,
      福神: `[[[ return states['\${entity}'].attributes.lunar?.吉神方位?.福神 || ''; ]]]`,
      财神: `[[[ return states['\${entity}'].attributes.lunar?.吉神方位?.财神 || ''; ]]]`,
      宜: `[[[ return states['\${entity}'].attributes.lunar?.宜 || ''; ]]]`,
      忌: `[[[ return states['\${entity}'].attributes.lunar?.忌 || ''; ]]]`,
      吉神: `[[[ return states['\${entity}'].attributes.lunar?.吉神 || ''; ]]]`,
      凶煞: `[[[ return states['\${entity}'].attributes.lunar?.凶煞 || ''; ]]]`,
    };
  }

  _evalTemplate(key, template) {
    if (!template) return "";
    try {
      let fn = this._templateCache.get(key);
      if (!fn) {
        const code = template.replace(/^\[\[\[\s*|\s*\]\]\]$/g, "").replace(/\$\{entity\}/g, this.config.entity);
        fn = new Function("states", `try { ${code} } catch(e) { return ""; }`);
        this._templateCache.set(key, fn);
      }
      return fn(this.hass.states);
    } catch (e) { return ""; }
  }

  render() {
    const entity = this.config.entity;
    const stateObj = this.hass?.states?.[entity];
    if (!stateObj) return html`<ha-card>实体未找到: ${entity}</ha-card>`;

    const fields = this.config.customize && this.config.fields
        ? { ...LunarInfoCard.defaultFields(), ...this.config.fields }
        : LunarInfoCard.defaultFields();

    const data = {};
    for (const key in fields) { data[key] = this._evalTemplate(key, fields[key]); }

    return html`
      <ha-card>
        <div class="card-container">
          ${this._section("a", "农历", { state: data["农历"], ganzhi: data["天干地支"], week: data["星期"] }, "a")}
          ${this._section("b", "五行", data["建除日"], "a")}
          ${this._section("c", "冲煞", data["冲煞"], "a")}
          ${this._section("d", "彭祖", html`${data["彭祖干"]}<br>${data["彭祖支"]}`, "a")}
          ${this._section("e", "喜神", data["喜神"], "b")}
          ${this._section("f", "福神", data["福神"], "b")}
          ${this._section("g", "财神", data["财神"], "b")}
          ${this._section("h", null, data["宜"], "c", false, "宜", "green")}
          ${this._section("i", null, data["忌"], "c", false, "忌", "red")}
          ${this._section("j", "吉神", data["吉神"], "c", true)}
          ${this._section("k", "凶煞", data["凶煞"], "c", true)}
        </div>
      </ha-card>
    `;
  }

  _section(area, name, value, layout = "a", bold = false, circle = null, circleColor = null) {
    const clsMap = { a: "grid-a", b: "grid-b", c: "grid-c" };
    const cls = clsMap[layout] || "grid-a";
    
    // 布局 c (底部四行) 强制使用 label-block 以支持多行
    const labelCls = (layout === "c") ? "label-block" : "label";

    if (area === "a" && name === "农历") {
      return html`
        <div class="lunar" style="grid-area:${area};">
          <div class="name">农历${value?.state || ""}</div>
          <div class="label">${value?.ganzhi || ""} ${value?.week || ""}</div>
        </div>`;
    }

    return html`
      <div class="${cls}" style="grid-area:${area};">
        ${circle ? html`<div class="circle ${circleColor}">${circle}</div>` 
                 : html`<div class="name" style="${bold ? 'font-weight:bold' : ''}">${name}</div>`}
        <div class="${labelCls}" title="${typeof value === 'string' ? value : ''}">
          ${value || ""}
        </div>
      </div>`;
  }

  getGridOptions() { return { rows: 8, columns: 12 }; }
  static getStubConfig() { return { entity: "sensor.tianyuan_nong_li_main_lunar" }; }
  static async getConfigElement() { return document.createElement("lunar-info-card-editor"); }
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
          const labels = { entity: "选择实体", customize: "开启高级模板自定义" };
          return labels[s.name] || s.name;
        }}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("lunar-info-card-editor", LunarInfoCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lunar-info-card",
  name: "Lunar Info Card",
  preview: true,
  description: "基于 TianYuan Calendar 的专业农历信息卡片",
  documentationURL: "https://github.com/hzonz/lunar-info-card",
});
