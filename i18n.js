"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;else root.GuideI18n = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  let language = 'en',
    dictionary = {},
    reverse = {},
    matcher = null;
  const escapeRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function configure(entries) {
    dictionary = entries;
    reverse = {};
    for (const [sv, en] of Object.entries(entries)) if (en !== sv && !reverse[en]) reverse[en] = sv;
    const keys = Object.keys(entries).filter(k => k && entries[k] !== k).sort((a, b) => b.length - a.length);
    matcher = keys.length ? new RegExp('(?<![\\p{L}\\p{N}_])(?:' + keys.map(escapeRE).join('|') + ')(?![\\p{L}\\p{N}_])', 'gu') : null;
  }
  function setLanguage(value) {
    language = value === 'sv' ? 'sv' : 'en';
  }
  function t(value) {
    if (value && typeof value === 'object' && 'en' in value && 'sv' in value) return value[language];
    if (typeof value !== 'string') return value;
    return language === 'sv' ? reverse[value] ?? value : dictionary[value] ?? value;
  }
  // Only authored literal template segments go through m(); interpolated user data never does.
  function m(value) {
    if (typeof value !== 'string' || language === 'sv' || !matcher) return value;
    return value.replace(matcher, key => dictionary[key]);
  }
  function h(strings, ...values) {
    return strings.reduce((out, part, index) => out + m(part) + (index < values.length ? String(values[index] ?? '') : ''), '');
  }
  function localize(value) {
    if (typeof value === 'string') return t(value);
    if (Array.isArray(value)) return value.map(localize);
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 2 && 'en' in value && 'sv' in value) return value[language];
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item)]));
    }
    return value;
  }
  return {
    configure,
    setLanguage,
    t,
    m,
    h,
    localize,
    get language() {
      return language;
    }
  };
});