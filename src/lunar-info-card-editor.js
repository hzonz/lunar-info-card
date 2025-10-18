import { LitElement, html } from "lit";
import { DEFAULT_FIELDS } from "./lunar-utils.js";

export class LunarInfoCardEditor extends LitElement {
  static properties = {
    hass: {},
    _config: {}, // 保存卡片配置
  };

  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = { customize: false, ...config };
    if (this._config.customize && !this._config.fields) {
      this._config.fields = { ...DEFAULT_FIELDS };
    }
  }

  _valueChanged(ev) {
    const newConfig = ev.detail.value;
    if (!newConfig.customize) {
      delete newConfig.customize;
      delete newConfig.fields;
    }
    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: this._config } })
    );
  }

  render() {
    if (!this.hass) return html``;

    const fieldKeys = Object.keys(DEFAULT_FIELDS);

    const schema = [
      { name: "entity", selector: { entity: {} } },
      { name: "customize", selector: { boolean: {} } },
    ];

    if (this._config?.customize) {
      schema.push({
        name: "fields",
        type: "expandable",
        icon: "mdi:calendar",
        schema: fieldKeys.map((key) => ({ name: key, selector: { template: {} } })),
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
