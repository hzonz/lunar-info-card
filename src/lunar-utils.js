// src/lunar-utils.js
// 默认字段模板
export const DEFAULT_FIELDS = {
  农历: `[[[ return states[entity]?.state || ''; ]]]`,
  年干支: `[[[ return states[entity]?.attributes.lunar?.['年干支'] || ''; ]]]`,
  月干支: `[[[ return states[entity]?.attributes.lunar?.干支?.月 || ''; ]]]`,
  日干支: `[[[ return states[entity]?.attributes.lunar?.干支?.日 || ''; ]]]`,
  星期: `[[[ return states[entity]?.attributes.lunar?.星期 || ''; ]]]`,
  建除日: `[[[ return states[entity]?.attributes.lunar?.建除日 || ''; ]]]`,
  冲煞: `[[[ return states[entity]?.attributes.lunar?.冲煞 || ''; ]]]`,
  彭祖干: `[[[ return states[entity]?.attributes.lunar?.['彭祖干'] || ''; ]]]`,
  彭祖支: `[[[ return states[entity]?.attributes.lunar?.['彭祖支'] || ''; ]]]`,
  喜神: `[[[ return states[entity]?.attributes.lunar?.喜神 || ''; ]]]`,
  福神: `[[[ return states[entity]?.attributes.lunar?.福神 || ''; ]]]`,
  财神: `[[[ return states[entity]?.attributes.lunar?.财神 || ''; ]]]`,
  宜: `[[[ return states[entity]?.attributes.lunar?.宜 || ''; ]]]`,
  忌: `[[[ return states[entity]?.attributes.lunar?.忌 || ''; ]]]`,
  吉神: `[[[ return states[entity]?.attributes.lunar?.吉神 || ''; ]]]`,
  凶煞: `[[[ return states[entity]?.attributes.lunar?.凶煞 || ''; ]]]`,
};

// 模板缓存 Map
const _evalCache = new Map();

/**
 * 安全执行模板
 * @param {string} template 模板字符串，例如 [[[ return states[entity].state ]]]
 * @param {object} states Home Assistant states 对象
 * @param {string} entity 实体 ID
 * @returns 解析后的值
 */
export function evalTemplate(template, states, entity) {
  if (!template) return "";
  const cacheKey = `${template}::${entity}`;
  if (_evalCache.has(cacheKey)) return _evalCache.get(cacheKey);

  try {
    // 去掉 [[[ ]]] 包裹
    const code = template.replace(/^\[\[\[\s*|\s*\]\]\]$/g, "");
    // 明确传入 states 和 entity
    const func = new Function("states", "entity", `return (${code});`);
    const result = func(states, entity);
    _evalCache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.warn("模板执行失败:", template, e);
    return "";
  }
}
