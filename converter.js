// UTC ⇔ JST 変換ロジック / conversion logic (browser + Node)
(function (root) {
  'use strict';

  var JST_OFFSET_MS = 9 * 60 * 60 * 1000; // JST は常に UTC+9（夏時間なし）/ always UTC+9, no DST

  var DATE_RE = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;

  // 入力文字列を epoch ミリ秒に変換。解析できなければ null。
  // Parse input into epoch ms, or null if invalid.
  // offsetMs: タイムゾーン指定がない場合に使うオフセット / offset used when the input has none
  function parse(input, offsetMs) {
    var s = String(input).trim();
    if (s === '') return null;

    // Unix timestamp: 12桁以上はミリ秒、それ以外は秒 / 12+ digits = ms, else seconds
    if (/^-?\d+$/.test(s)) {
      var digits = s.replace('-', '').length;
      var n = Number(s);
      return digits >= 12 ? n : n * 1000;
    }

    var m = DATE_RE.exec(s);
    if (!m) return null;

    var y = +m[1], mo = +m[2], d = +m[3];
    var h = +(m[4] || 0), mi = +(m[5] || 0), sec = +(m[6] || 0);
    var ms = m[7] ? +(m[7] + '00').slice(0, 3) : 0;

    var utc = Date.UTC(y, mo - 1, d, h, mi, sec, ms);
    // 2026-02-30 のような存在しない日時を弾く / reject non-existent dates like 2026-02-30
    var check = new Date(utc);
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d ||
        check.getUTCHours() !== h || check.getUTCMinutes() !== mi || check.getUTCSeconds() !== sec) {
      return null;
    }

    var tz = m[8];
    var offset = offsetMs;
    if (tz) {
      if (tz.toUpperCase() === 'Z') {
        offset = 0;
      } else {
        var sign = tz[0] === '-' ? -1 : 1;
        var t = tz.slice(1).replace(':', '');
        offset = sign * (+t.slice(0, 2) * 60 + +t.slice(2, 4)) * 60000;
      }
    }
    return utc - offset;
  }

  function pad(n, w) {
    return String(n).padStart(w || 2, '0');
  }

  // epoch ミリ秒を指定オフセットの "YYYY-MM-DD HH:mm:ss" に整形
  // Format epoch ms as "YYYY-MM-DD HH:mm:ss" at the given offset
  function format(epochMs, offsetMs) {
    var d = new Date(epochMs + offsetMs);
    var out = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
      ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
    var ms = d.getUTCMilliseconds();
    return ms ? out + '.' + pad(ms, 3) : out;
  }

  var api = {
    JST_OFFSET_MS: JST_OFFSET_MS,
    parse: parse,
    format: format,
    parseUtc: function (s) { return parse(s, 0); },
    parseJst: function (s) { return parse(s, JST_OFFSET_MS); },
    formatUtc: function (t) { return format(t, 0); },
    formatJst: function (t) { return format(t, JST_OFFSET_MS); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TimeConverter = api;
})(this);
