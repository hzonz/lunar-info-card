import { LitElement, html, css } from "lit";
import { state, query } from "lit/decorators.js";
import { evalTemplate, DEFAULT_FIELDS } from "./lunar-utils.js";

const LUNAR_CARD_VERSION = "v0.0.2-lit";

console.info(
  `%c Lunar Info Card ${LUNAR_CARD_VERSION} `,
  "color:#1976d2;font-weight:bold;background:#e3f2fd;border-radius:4px;padding:2px 6px;"
);

export class LunarInfoCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  @state() _data = {};

  static styles = css`
    :host { display:block; height:100%; }
    ha-card { padding:10px; height:100%; box-sizing:border-box; }
    .card-container {
      display:grid;
      grid-template-areas:
        "a b b b"
        "a c c c"
        "a d d d"
        "a e f g"
        "h h h h"
        "i i i i"
        "j j j j"
        "k k k k";
      grid-template-columns:repeat(4,1fr);
      gap:2px;
    }
    .lunar { grid-area:a; display:grid; grid-template-areas:"n l"; }
    .lunar .name { writing-mode:vertical-lr; font-weight:bold; font-size:clamp(1.8em,2.1em,2.5em); }
    .lunar .label { writing-mode:vertical-lr; font-size:clamp(0.9em,1.1em,1.2em); }
    .label, .label-block { font-size:clamp(0.85rem,1.1em,1.3rem); }
    .circle { width:1.6em;height:1.6em;border-radius:50%;text-align:center; }
    .circle.green { background:green;color:white; }
    .circle.red { background:red;color:white; }
  `;

  setConfig(config) {
    if (!config.entity) throw new Error("请设置 entity，例如: sensor.nong_li");
    this.config = config;
  }

  get fields() {
    return this.config.customize && this.config.fields
      ? { ...DEFAULT_FIELDS, ...this.config.fields }
      : DEFAULT_FIELDS;
  }

  updated() {
    if (this.hass && this.config) {
      const entity = this.config.entity;
      const states = this.hass.states;
      this._data = Object.fromEntries(
        Object.entries(this.fields).map(([k, t]) => [k, evalTemplate(t, states, entity)])
      );
    }
  }

  render() {
    const entity = this.config.entity;
    const stateObj = this.hass?.states?.[entity];
    if (!stateObj)
      return html`<ha-card><div>实体 ${entity} 不存在</div></ha-card>`;

    const d = this._data;

    return html`
      <ha-card>
        <div class="card-container">
          ${this._section("a","农历",{state:d["农历"],ganzhiYear:d["年干支"],ganzhiMonth:d["月干支"],ganzhiDay:d["日干支"],week:d["星期"]})}
          ${this._section("b","五行",d["建除日"])}
          ${this._section("c","冲煞",d["冲煞"])}
          ${this._section("d","彭祖",html`${d["彭祖干"]}<br>${d["彭祖支"]}`)}
          ${this._section("e","喜神",d["喜神"],"b")}
          ${this._section("f","福神",d["福神"],"b")}
          ${this._section("g","财神",d["财神"],"b")}
          ${this._section("h",null,d["宜"],"c",false,"宜","green")}
          ${this._section("i",null,d["忌"],"c",false,"忌","red")}
          ${this._section("j","吉神",d["吉神"],"c",true)}
          ${this._section("k","凶煞",d["凶煞"],"c",true)}
        </div>
      </ha-card>
    `;
  }

  _section(area, name, value, layout="a", bold=false, circle=null, circleColor=null) {
    if (area==="a" && name==="农历") {
      return html`
        <div class="lunar">
          <div class="name">农历${value?.state||""}</div>
          <div class="label">
            ${(value?.ganzhiYear||"")+" "+(value?.ganzhiMonth||"")+" "+(value?.ganzhiDay||"")+" "+(value?.week||"")}
          </div>
        </div>
      `;
    }
    return html`
      <div class="grid-${layout}" style="grid-area:${area};">
        ${circle
          ? html`<div class="circle ${circleColor||''}">${circle}</div>`
          : html`<div class="name" style="${bold?'font-weight:bold':''}">${name}</div>`}
        <div class="${circle?'label-block':'label'}">${value||""}</div>
      </div>
    `;
  }

  static getStubConfig() {
    return { entity: "sensor.nong_li" };
  }

  static async getConfigElement() {
    await import("./lunar-info-card-editor.js");
    return document.createElement("lunar-info-card-editor");
  }
}

customElements.define("lunar-info-card", LunarInfoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lunar-info-card",
  name: "Lunar Info Card",
  preview: true,
  description: "显示农历和相关信息",
  documentationURL: "https://github.com/hzonz/lunar-info-card",
});
