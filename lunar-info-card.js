import { LitElement, html, css } from "https://unpkg.com/lit@3.1.0/index.js?module";

// 主卡片：Lunar Info Card
const LUNAR_CARD_VERSION = "v0.0.1-lit";

console.log(
  `%cLunar Info Card ${LUNAR_CARD_VERSION}`,
  "color: #1976d2; font-weight: bold; background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 2px 6px;"
);

class LunarInfoCard extends LitElement {
  static properties = { hass: {}, config: {} };

  static styles = css`
    :host {
      display: block; 
      --lunar-font-size: clamp(1.8em, 2.1em, 2.5em);
      --lunar-lunar-size: clamp(0.9em, 1.1em, 1.2em);
      --lunar-title-size: clamp(0.85em, 1.1em, 1.3em);
      --lunar-label-size: clamp(0.85rem, 1.1em, 1.3rem);
      height: 100%;
    }
    ha-card {
      padding: 10px;
      box-sizing: border-box;
      height: 100%;
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
      gap: 2px;
      height: 100%;
    }
    .lunar { grid-area: a; display: grid; grid-template-areas: "n l"; }
    .lunar .name { writing-mode: vertical-lr; font-weight: bold; font-size: var(--lunar-font-size); letter-spacing: 0.3em; }
    .lunar .label { writing-mode: vertical-lr; font-size: var(--lunar-lunar-size); letter-spacing: 0.2em; }
    .grid-a { display: grid; grid-template-areas: "n l"; grid-template-columns: 1fr 2fr; }
    .grid-b { display: grid; align-self: center; justify-items: start; grid-template-areas: "n" "l"; }
    .grid-c { display: grid; grid-template-areas: "n l"; grid-template-columns: 1fr 4fr; }
    .grid-b .label { font-size: var(--lunar-label-size); justify-self: center; }
    .name { font-weight: bold; font-size: var(--lunar-title-size); justify-self: center; align-self: center; }
    .label, .label-block { font-size: var(--lunar-label-size); align-self: center; font-weight: lighter; overflow: hidden; text-overflow: ellipsis; }
    .circle { width: 1.6em; height: 1.6em; border-radius: 50%; justify-self: center; align-self: center; color: white; font-size: 1.3em; text-align: center; }
    .circle.green { background-color: green; }
    .circle.red { background-color: red; }
  `;

  setConfig(config) {
    if (!config.entity) throw new Error("请设置 entity，例如: sensor.nong_li");
    this.config = { ...config };
  }

  // 默认模板
  static defaultFields() {
    return {
      农历: `[[[ return states['\${entity}'].state ]]]`,
      年干支: `[[[ return states['\${entity}'].attributes.lunar?.['年干支'] || ''; ]]]`,
      月干支: `[[[ return states['\${entity}'].attributes.lunar?.干支?.月 || ''; ]]]`,
      日干支: `[[[ return states['\${entity}'].attributes.lunar?.干支?.日 || ''; ]]]`,
      星期: `[[[ return states['\${entity}'].attributes.lunar?.星期 || ''; ]]]`,
      建除日: `[[[ return states['\${entity}'].attributes.lunar?.建除日 || ''; ]]]`,
      冲煞: `[[[ return states['\${entity}'].attributes.lunar?.冲煞 || ''; ]]]`,
      彭祖干: `[[[ return states['\${entity}'].attributes.lunar?.['彭祖干'] || ''; ]]]`,
      彭祖支: `[[[ return states['\${entity}'].attributes.lunar?.['彭祖支'] || ''; ]]]`,
      喜神: `[[[ return states['\${entity}'].attributes.lunar?.喜神 || ''; ]]]`,
      福神: `[[[ return states['\${entity}'].attributes.lunar?.福神 || ''; ]]]`,
      财神: `[[[ return states['\${entity}'].attributes.lunar?.财神 || ''; ]]]`,
      宜: `[[[ return states['\${entity}'].attributes.lunar?.宜 || ''; ]]]`,
      忌: `[[[ return states['\${entity}'].attributes.lunar?.忌 || ''; ]]]`,
      吉神: `[[[ return states['\${entity}'].attributes.lunar?.吉神 || ''; ]]]`,
      凶煞: `[[[ return states['\${entity}'].attributes.lunar?.凶煞 || ''; ]]]`,
    };
  }

  getGridOptions() {
    return {
      rows: 8,
      min_rows: 8,
      columns: 12,
      min_columns: 9,
      max_columns: 12,
    };
  }

  _evalTemplate(template) {
    if (!template) return "";
    try {
      const code = template.replace(/^\[\[\[\s*|\s*\]\]\]$/g, "");
      const entityId = this.config.entity;
      const parsedCode = code.replace(/\$\{entity\}/g, entityId);
      return Function("states", parsedCode)(this.hass.states);
    } catch (e) {
      console.warn("模板执行失败:", template, e);
      return "";
    }
  }

  render() {
    const entity = this.config.entity;
    const stateObj = this.hass?.states?.[entity];
    if (!stateObj) return html`<ha-card><div>实体 ${entity} 不存在</div></ha-card>`;

    // 如果没有 customize 或没有 fields，就用默认模板
    const fields =
      this.config.customize && this.config.fields
        ? { ...LunarInfoCard.defaultFields(), ...this.config.fields }
        : LunarInfoCard.defaultFields();

    const data = {};
    for (const key in fields) {
      data[key] = this._evalTemplate(fields[key]);
    }

    return html`
      <ha-card>
        <div class="card-container">
          ${this._section("a","农历",{state: data["农历"], ganzhiYear:data["年干支"], ganzhiMonth:data["月干支"], ganzhiDay:data["日干支"], week:data["星期"]},"a")}
          ${this._section("b","五行",data["建除日"],"a")}
          ${this._section("c","冲煞",data["冲煞"],"a")}
          ${this._section("d","彭祖",html`${data["彭祖干"]}<br>${data["彭祖支"]}`,"a")}
          ${this._section("e","喜神",data["喜神"],"b")}
          ${this._section("f","福神",data["福神"],"b")}
          ${this._section("g","财神",data["财神"],"b")}
          ${this._section("h",null,data["宜"],"c",false,"宜","green")}
          ${this._section("i",null,data["忌"],"c",false,"忌","red")}
          ${this._section("j","吉神",data["吉神"],"c",true)}
          ${this._section("k","凶煞",data["凶煞"],"c",true)}
        </div>
      </ha-card>
    `;
  }

  _section(area,name,value,layout="a",bold=false,circle=null,circleColor=null){
    const clsMap={a:"grid-a",b:"grid-b",c:"grid-c"};
    const cls=clsMap[layout]||"grid-a";
    if (area === "a" && name === "农历") {
      return html`<div class="lunar" style="grid-area:${area};">
        <div class="name">农历${value?.state || ""}</div>
        <div class="label">
          ${(value?.ganzhiYear || "") + " "}
          ${(value?.ganzhiMonth || "") + " "}
          ${(value?.ganzhiDay || "") + " "}
          ${(value?.week || "")}
        </div>
      </div>`;
    }
    return html`<div class="${cls}" style="grid-area:${area};">
      ${circle ? html`<div class="circle ${circleColor||''}">${circle}</div>` 
                 : html`<div class="name" style="${bold?'font-weight:bold':''}">${name}</div>`}
      <div class="${circle?'label-block':'label'}">${value||""}</div>
    </div>`;
  }

  static getStubConfig() {
    return { entity: "sensor.nong_li" };
  }

  static async getConfigElement() {
    return document.createElement("lunar-info-card-editor");
  }
}

customElements.define("lunar-info-card", LunarInfoCard);


// 编辑器：Lunar Info Card Editor
class LunarInfoCardEditor extends LitElement {
  static properties = {
    hass: {},
    _config: {},
  };

  setConfig(config) {
    this._config = { customize: false, ...config };
    if (this._config.customize && !this._config.fields) {
      this._config = {
        ...this._config,
        fields: LunarInfoCard.defaultFields(),
      };
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

    const fieldKeys = [
      "农历","年干支","月干支","日干支","星期",
      "建除日","冲煞","彭祖干","彭祖支",
      "喜神","福神","财神","宜","忌","吉神","凶煞"
    ];

    const schema = [
      { name: "entity", selector: { entity: {} } },
      { name: "customize", selector: { boolean: {} } },
    ];

    if (this._config?.customize) {
      schema.push({
        name: "fields",
        type: "expandable",
        icon: "mdi:calendar",
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
          if (s.name === "entity") return "选择实体";
          if (s.name === "customize") return "开启自定义模板";
          return s.name;
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
  description: "显示农历和相关信息",
  documentationURL: "https://github.com/hzonz/lunar-info-card",
});
