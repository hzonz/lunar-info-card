// src/lunar-utils.js
export const DEFAULT_FIELDS = {
  农历: `[[[ return states['${entity}']?.state; ]]]`,
  年干支: `[[[ return states['${entity}']?.attributes.lunar?.['年干支'] || ''; ]]]`,
  月干支: `[[[ return states['${entity}']?.attributes.lunar?.干支?.月 || ''; ]]]`,
  日干支: `[[[ return states['${entity}']?.attributes.lunar?.干支?.日 || ''; ]]]`,
  星期: `[[[ return states['${entity}']?.attributes.lunar?.星期 || ''; ]]]`,
  建除日: `[[[ return states['${entity}']?.attributes.lunar?.建除日 || ''; ]]]`,
  冲煞: `[[[ return states['${entity}']?.attributes.lunar?.冲煞 || ''; ]]]`,
  彭祖干: `[[[ return states['${entity}']?.attributes.lunar?.['彭祖干'] || ''; ]]]`,
  彭祖支: `[[[ return states['${entity}']?.attributes.lunar?.['彭祖支'] || ''; ]]]`,
  喜神: `[[[ return states['${entity}']?.attributes.lunar?.喜神 || ''; ]]]`,
  福神: `[[[ return states['${entity}']?.attributes.lunar?.福神 || ''; ]]]`,
  财神: `[[[ return states['${entity}']?.attributes.lunar?.财神 || ''; ]]]`,
  宜: `[[[ return states['${entity}']?.attributes.lunar?.宜 || ''; ]]]`,
  忌: `[[[ return states['${entity}']?.attributes.lunar?.忌 || ''; ]]]`,
  吉神: `[[[ return states['${entity}']?.attributes.lunar?.吉神 || ''; ]]]`,
  凶煞: `[[[ return states['${entity}']?.attributes.lunar?.凶煞 || ''; ]]]`,
};

// 模板缓存 Map
const _evalCache = new Map();

// 安全执行模板
export function evalTemplate(template, states, entityId) {
  if (!template) return "";
  if (_evalCache.has(template)) return _evalCache.get(template);

  try {
    const code = template.replace(/^\[\[\[\s*|\s*\]\]\]$/g, "");
    const parsedCode = code.replace(/\$\{entity\}/g, entityId);
    const sandbox = Object.freeze({ states });
    const func = new Function("sandbox", `with(sandbox){ return (${parsedCode}); }`);
    const result = func(sandbox);
    _evalCache.set(template, result);
    return result;
  } catch (e) {
    console.warn("模板执行失败:", template, e);
    return "";
  }
}
