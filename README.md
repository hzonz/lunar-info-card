
# 🗓️ Lunar Info Card

**Lunar Info Card** 是一个 Home Assistant 自定义卡片，用于展示农历、干支、宜忌、吉神、凶煞等信息。  
支持默认模板显示，也可通过内置编辑器启用“自定义模板”实现更灵活的数据渲染。

---

![lunar-info-card](https://github.com/user-attachments/assets/8fe87933-428f-4829-90ca-4549e09a061d)

## 🚀 特性

- ✅ [天元农历](https://github.com/hzonz/tianyuan_lunar)集成专用卡片。  
- 🧩 支持自定义编辑数据来源，理论支持所有农历实体。  
- ⚙️ 支持 Lovelace 编辑界面可视化配置。
- 🧱 支持 JS 模板语法（[[[ ... ]]]），灵活自定义每个字段内容  

---

## 安装

### 使用 HACS（推荐）

1. 打开 Home Assistant 的 HACS 页面  
2. 点击右上角 **“添加存储库 (Custom Repository)”**  
3. 填入仓库 URL:  
```yaml
https://github.com/hzonz/lunar-info-card
```
4. 类型选择 **Dashboard**，然后添加  
5. 搜索 **Lunar Info Card** 并安装  

### 手动安装

1. 下载 `lunar-info-card.js` 文件  
2. 放到 `www` 文件夹下，例如：  
```yaml
www/custom-stack-cards/lunar-info-card.js
```
3. 在 Lovelace 配置中引用：  
```yaml
resources:
  - url: /local/lunar-info-card/lunar-info-card.js
    type: module
```

---

## 配置参数

| 参数            | 类型     | 默认值 | 说明                                                                  |
| ------------- | ------ | --- | ------------------------------------------------------------------- |
| type          | string | 无  | 固定为 `custom:lunar-info-card`                                      |
| entity        | string | 无  | 农历传感器实体，例如 `sensor.lunar_date`                               |
| customize     | boolean | false | 是否启用自定义模板字段                                               |
| fields        | object  | —   | 自定义字段模板（仅当 `customize: true` 时生效）                        |

---

## 使用示例

### 最小添加
```yaml
type: custom:lunar-info-card
entity: sensor.tianyuan_calendar_main_lunar  #默认
```

### 自定义添加
```yaml
type: custom:lunar-info-card
entity: sensor.lunar_date
customize: true
fields:
  农历: '[[[ return states["sensor.lunar_date"].state ]]]'
  年干支: '[[[ return states["sensor.lunar_year"].state ]]]'
  月干支: '[[[ return states["sensor.lunar_month"].state ]]]'
  日干支: '[[[ return states["sensor.lunar_day"].state ]]]'
  星期: '[[[ return states["sensor.week_day"].state ]]]'
  宜: '[[[ return states["sensor.yi"].state ]]]'
  忌: '[[[ return states['${entity}'].attributes.lunar?.忌 || '' ]]]'
  ...
```

## 链接
- 仓库地址：[hzonz/lunar-info-card](https://github.com/hzonz/lunar-info-card)
- 卡片参考：[6tail ](https://6tail.cn/calendar/api.html#overview.html) —— 感谢作者 [6tail](https://github.com/6tail/lunar-javascript) 的开源贡献
