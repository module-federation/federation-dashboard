/*! For license information please see 584.js.LICENSE.txt */
(window.webpackJsonp_dashboard_dsl =
  window.webpackJsonp_dashboard_dsl || []).push([
  [584],
  {
    50404: function (t, r, e) {
      "use strict";
      var n =
        (this && this.__importDefault) ||
        function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      Object.defineProperty(r, "__esModule", { value: !0 });
      var a = n(e(98621));
      function i(t, r, e) {
        var n;
        return (
          (n =
            Math.round(t.h) >= 60 && Math.round(t.h) <= 240
              ? e
                ? Math.round(t.h) - 2 * r
                : Math.round(t.h) + 2 * r
              : e
              ? Math.round(t.h) + 2 * r
              : Math.round(t.h) - 2 * r) < 0
            ? (n += 360)
            : n >= 360 && (n -= 360),
          n
        );
      }
      function o(t, r, e) {
        return 0 === t.h && 0 === t.s
          ? t.s
          : ((n = e
              ? Math.round(100 * t.s) - 16 * r
              : 4 === r
              ? Math.round(100 * t.s) + 16
              : Math.round(100 * t.s) + 5 * r) > 100 && (n = 100),
            e && 5 === r && n > 10 && (n = 10),
            n < 6 && (n = 6),
            n);
        var n;
      }
      function s(t, r, e) {
        return e
          ? Math.round(100 * t.v) + 5 * r
          : Math.round(100 * t.v) - 15 * r;
      }
      r.default = function (t) {
        for (var r = [], e = a.default(t), n = 5; n > 0; n -= 1) {
          var f = e.toHsv(),
            u = a
              .default({ h: i(f, n, !0), s: o(f, n, !0), v: s(f, n, !0) })
              .toHexString();
          r.push(u);
        }
        for (r.push(e.toHexString()), n = 1; n <= 4; n += 1) {
          (f = e.toHsv()),
            (u = a
              .default({ h: i(f, n), s: o(f, n), v: s(f, n) })
              .toHexString());
          r.push(u);
        }
        return r;
      };
    },
    28297: function (t, r, e) {
      "use strict";
      var n =
        (this && this.__importDefault) ||
        function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      Object.defineProperty(r, "__esModule", { value: !0 });
      var a = n(e(50404));
      r.generate = a.default;
      var i = {
        red: "#F5222D",
        volcano: "#FA541C",
        orange: "#FA8C16",
        gold: "#FAAD14",
        yellow: "#FADB14",
        lime: "#A0D911",
        green: "#52C41A",
        cyan: "#13C2C2",
        blue: "#1890FF",
        geekblue: "#2F54EB",
        purple: "#722ED1",
        magenta: "#EB2F96",
        grey: "#666666",
      };
      r.presetPrimaryColors = i;
      var o = {};
      (r.presetPalettes = o),
        Object.keys(i).forEach(function (t) {
          (o[t] = a.default(i[t])), (o[t].primary = o[t][5]);
        });
      var s = o.red;
      r.red = s;
      var f = o.volcano;
      r.volcano = f;
      var u = o.gold;
      r.gold = u;
      var l = o.orange;
      r.orange = l;
      var h = o.yellow;
      r.yellow = h;
      var c = o.lime;
      r.lime = c;
      var d = o.green;
      r.green = d;
      var g = o.cyan;
      r.cyan = g;
      var b = o.blue;
      r.blue = b;
      var p = o.geekblue;
      r.geekblue = p;
      var v = o.purple;
      r.purple = v;
      var m = o.magenta;
      r.magenta = m;
      var _ = o.grey;
      r.grey = _;
    },
    61357: (t, r, e) => {
      "use strict";
      function n(t, r) {
        (null == r || r > t.length) && (r = t.length);
        for (var e = 0, n = new Array(r); e < r; e++) n[e] = t[e];
        return n;
      }
      e.d(r, { Z: () => n });
    },
    49507: (t, r, e) => {
      "use strict";
      function n(t) {
        if (Array.isArray(t)) return t;
      }
      e.d(r, { Z: () => n });
    },
    51119: (t, r, e) => {
      "use strict";
      function n(t, r, e) {
        return (
          r in t
            ? Object.defineProperty(t, r, {
                value: e,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (t[r] = e),
          t
        );
      }
      e.d(r, { Z: () => n });
    },
    9007: (t, r, e) => {
      "use strict";
      function n() {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      }
      e.d(r, { Z: () => n });
    },
    60557: (t, r, e) => {
      "use strict";
      function n(t, r) {
        if (null == t) return {};
        var e,
          n,
          a = (function (t, r) {
            if (null == t) return {};
            var e,
              n,
              a = {},
              i = Object.keys(t);
            for (n = 0; n < i.length; n++)
              (e = i[n]), r.indexOf(e) >= 0 || (a[e] = t[e]);
            return a;
          })(t, r);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(t);
          for (n = 0; n < i.length; n++)
            (e = i[n]),
              r.indexOf(e) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(t, e) &&
                  (a[e] = t[e]));
        }
        return a;
      }
      e.d(r, { Z: () => n });
    },
    35388: (t, r, e) => {
      "use strict";
      e.d(r, { Z: () => o });
      var n = e(49507);
      var a = e(70237),
        i = e(9007);
      function o(t, r) {
        return (
          (0, n.Z)(t) ||
          (function (t, r) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(t)) {
              var e = [],
                n = !0,
                a = !1,
                i = void 0;
              try {
                for (
                  var o, s = t[Symbol.iterator]();
                  !(n = (o = s.next()).done) &&
                  (e.push(o.value), !r || e.length !== r);
                  n = !0
                );
              } catch (t) {
                (a = !0), (i = t);
              } finally {
                try {
                  n || null == s.return || s.return();
                } finally {
                  if (a) throw i;
                }
              }
              return e;
            }
          })(t, r) ||
          (0, a.Z)(t, r) ||
          (0, i.Z)()
        );
      }
    },
    90929: (t, r, e) => {
      "use strict";
      function n(t) {
        return (n =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (t) {
                return typeof t;
              }
            : function (t) {
                return t &&
                  "function" == typeof Symbol &&
                  t.constructor === Symbol &&
                  t !== Symbol.prototype
                  ? "symbol"
                  : typeof t;
              })(t);
      }
      e.d(r, { Z: () => n });
    },
    70237: (t, r, e) => {
      "use strict";
      e.d(r, { Z: () => a });
      var n = e(61357);
      function a(t, r) {
        if (t) {
          if ("string" == typeof t) return (0, n.Z)(t, r);
          var e = Object.prototype.toString.call(t).slice(8, -1);
          return (
            "Object" === e && t.constructor && (e = t.constructor.name),
            "Map" === e || "Set" === e
              ? Array.from(t)
              : "Arguments" === e ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)
              ? (0, n.Z)(t, r)
              : void 0
          );
        }
      }
    },
    72779: (t, r) => {
      var e;
      !(function () {
        "use strict";
        var n = {}.hasOwnProperty;
        function a() {
          for (var t = [], r = 0; r < arguments.length; r++) {
            var e = arguments[r];
            if (e) {
              var i = typeof e;
              if ("string" === i || "number" === i) t.push(e);
              else if (Array.isArray(e) && e.length) {
                var o = a.apply(null, e);
                o && t.push(o);
              } else if ("object" === i)
                for (var s in e) n.call(e, s) && e[s] && t.push(s);
            }
          }
          return t.join(" ");
        }
        t.exports
          ? ((a.default = a), (t.exports = a))
          : void 0 ===
              (e = function () {
                return a;
              }.apply(r, [])) || (t.exports = e);
      })();
    },
    12917: (t) => {
      var r = [],
        e = [];
      function n(t, n) {
        if (((n = n || {}), void 0 === t))
          throw new Error(
            "insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options])."
          );
        var a,
          i = !0 === n.prepend ? "prepend" : "append",
          o =
            void 0 !== n.container
              ? n.container
              : document.querySelector("head"),
          s = r.indexOf(o);
        return (
          -1 === s && ((s = r.push(o) - 1), (e[s] = {})),
          void 0 !== e[s] && void 0 !== e[s][i]
            ? (a = e[s][i])
            : ((a = e[s][i] = (function () {
                var t = document.createElement("style");
                return t.setAttribute("type", "text/css"), t;
              })()),
              "prepend" === i
                ? o.insertBefore(a, o.childNodes[0])
                : o.appendChild(a)),
          65279 === t.charCodeAt(0) && (t = t.substr(1, t.length)),
          a.styleSheet ? (a.styleSheet.cssText += t) : (a.textContent += t),
          a
        );
      }
      (t.exports = n), (t.exports.insertCss = n);
    },
    72895: (t, r, e) => {
      "use strict";
      e.d(r, { ET: () => s, ZP: () => f });
      var n = {};
      function a(t, r) {
        0;
      }
      function i(t, r) {
        0;
      }
      function o(t, r, e) {
        r || n[e] || (t(!1, e), (n[e] = !0));
      }
      function s(t, r) {
        o(i, t, r);
      }
      const f = function (t, r) {
        o(a, t, r);
      };
    },
    98621: (t, r, e) => {
      var n;
      !(function (a) {
        var i = /^\s+/,
          o = /\s+$/,
          s = 0,
          f = a.round,
          u = a.min,
          l = a.max,
          h = a.random;
        function c(t, r) {
          if (((r = r || {}), (t = t || "") instanceof c)) return t;
          if (!(this instanceof c)) return new c(t, r);
          var e = (function (t) {
            var r = { r: 0, g: 0, b: 0 },
              e = 1,
              n = null,
              s = null,
              f = null,
              h = !1,
              c = !1;
            "string" == typeof t &&
              (t = (function (t) {
                t = t.replace(i, "").replace(o, "").toLowerCase();
                var r,
                  e = !1;
                if (M[t]) (t = M[t]), (e = !0);
                else if ("transparent" == t)
                  return { r: 0, g: 0, b: 0, a: 0, format: "name" };
                if ((r = B.rgb.exec(t))) return { r: r[1], g: r[2], b: r[3] };
                if ((r = B.rgba.exec(t)))
                  return { r: r[1], g: r[2], b: r[3], a: r[4] };
                if ((r = B.hsl.exec(t))) return { h: r[1], s: r[2], l: r[3] };
                if ((r = B.hsla.exec(t)))
                  return { h: r[1], s: r[2], l: r[3], a: r[4] };
                if ((r = B.hsv.exec(t))) return { h: r[1], s: r[2], v: r[3] };
                if ((r = B.hsva.exec(t)))
                  return { h: r[1], s: r[2], v: r[3], a: r[4] };
                if ((r = B.hex8.exec(t)))
                  return {
                    r: Z(r[1]),
                    g: Z(r[2]),
                    b: Z(r[3]),
                    a: T(r[4]),
                    format: e ? "name" : "hex8",
                  };
                if ((r = B.hex6.exec(t)))
                  return {
                    r: Z(r[1]),
                    g: Z(r[2]),
                    b: Z(r[3]),
                    format: e ? "name" : "hex",
                  };
                if ((r = B.hex4.exec(t)))
                  return {
                    r: Z(r[1] + "" + r[1]),
                    g: Z(r[2] + "" + r[2]),
                    b: Z(r[3] + "" + r[3]),
                    a: T(r[4] + "" + r[4]),
                    format: e ? "name" : "hex8",
                  };
                if ((r = B.hex3.exec(t)))
                  return {
                    r: Z(r[1] + "" + r[1]),
                    g: Z(r[2] + "" + r[2]),
                    b: Z(r[3] + "" + r[3]),
                    format: e ? "name" : "hex",
                  };
                return !1;
              })(t));
            "object" == typeof t &&
              ($(t.r) && $(t.g) && $(t.b)
                ? ((d = t.r),
                  (g = t.g),
                  (b = t.b),
                  (r = {
                    r: 255 * E(d, 255),
                    g: 255 * E(g, 255),
                    b: 255 * E(b, 255),
                  }),
                  (h = !0),
                  (c = "%" === String(t.r).substr(-1) ? "prgb" : "rgb"))
                : $(t.h) && $(t.s) && $(t.v)
                ? ((n = q(t.s)),
                  (s = q(t.v)),
                  (r = (function (t, r, e) {
                    (t = 6 * E(t, 360)), (r = E(r, 100)), (e = E(e, 100));
                    var n = a.floor(t),
                      i = t - n,
                      o = e * (1 - r),
                      s = e * (1 - i * r),
                      f = e * (1 - (1 - i) * r),
                      u = n % 6;
                    return {
                      r: 255 * [e, s, o, o, f, e][u],
                      g: 255 * [f, e, e, s, o, o][u],
                      b: 255 * [o, o, f, e, e, s][u],
                    };
                  })(t.h, n, s)),
                  (h = !0),
                  (c = "hsv"))
                : $(t.h) &&
                  $(t.s) &&
                  $(t.l) &&
                  ((n = q(t.s)),
                  (f = q(t.l)),
                  (r = (function (t, r, e) {
                    var n, a, i;
                    function o(t, r, e) {
                      return (
                        e < 0 && (e += 1),
                        e > 1 && (e -= 1),
                        e < 1 / 6
                          ? t + 6 * (r - t) * e
                          : e < 0.5
                          ? r
                          : e < 2 / 3
                          ? t + (r - t) * (2 / 3 - e) * 6
                          : t
                      );
                    }
                    if (
                      ((t = E(t, 360)),
                      (r = E(r, 100)),
                      (e = E(e, 100)),
                      0 === r)
                    )
                      n = a = i = e;
                    else {
                      var s = e < 0.5 ? e * (1 + r) : e + r - e * r,
                        f = 2 * e - s;
                      (n = o(f, s, t + 1 / 3)),
                        (a = o(f, s, t)),
                        (i = o(f, s, t - 1 / 3));
                    }
                    return { r: 255 * n, g: 255 * a, b: 255 * i };
                  })(t.h, n, f)),
                  (h = !0),
                  (c = "hsl")),
              t.hasOwnProperty("a") && (e = t.a));
            var d, g, b;
            return (
              (e = j(e)),
              {
                ok: h,
                format: t.format || c,
                r: u(255, l(r.r, 0)),
                g: u(255, l(r.g, 0)),
                b: u(255, l(r.b, 0)),
                a: e,
              }
            );
          })(t);
          (this._originalInput = t),
            (this._r = e.r),
            (this._g = e.g),
            (this._b = e.b),
            (this._a = e.a),
            (this._roundA = f(100 * this._a) / 100),
            (this._format = r.format || e.format),
            (this._gradientType = r.gradientType),
            this._r < 1 && (this._r = f(this._r)),
            this._g < 1 && (this._g = f(this._g)),
            this._b < 1 && (this._b = f(this._b)),
            (this._ok = e.ok),
            (this._tc_id = s++);
        }
        function d(t, r, e) {
          (t = E(t, 255)), (r = E(r, 255)), (e = E(e, 255));
          var n,
            a,
            i = l(t, r, e),
            o = u(t, r, e),
            s = (i + o) / 2;
          if (i == o) n = a = 0;
          else {
            var f = i - o;
            switch (((a = s > 0.5 ? f / (2 - i - o) : f / (i + o)), i)) {
              case t:
                n = (r - e) / f + (r < e ? 6 : 0);
                break;
              case r:
                n = (e - t) / f + 2;
                break;
              case e:
                n = (t - r) / f + 4;
            }
            n /= 6;
          }
          return { h: n, s: a, l: s };
        }
        function g(t, r, e) {
          (t = E(t, 255)), (r = E(r, 255)), (e = E(e, 255));
          var n,
            a,
            i = l(t, r, e),
            o = u(t, r, e),
            s = i,
            f = i - o;
          if (((a = 0 === i ? 0 : f / i), i == o)) n = 0;
          else {
            switch (i) {
              case t:
                n = (r - e) / f + (r < e ? 6 : 0);
                break;
              case r:
                n = (e - t) / f + 2;
                break;
              case e:
                n = (t - r) / f + 4;
            }
            n /= 6;
          }
          return { h: n, s: a, v: s };
        }
        function b(t, r, e, n) {
          var a = [
            I(f(t).toString(16)),
            I(f(r).toString(16)),
            I(f(e).toString(16)),
          ];
          return n &&
            a[0].charAt(0) == a[0].charAt(1) &&
            a[1].charAt(0) == a[1].charAt(1) &&
            a[2].charAt(0) == a[2].charAt(1)
            ? a[0].charAt(0) + a[1].charAt(0) + a[2].charAt(0)
            : a.join("");
        }
        function p(t, r, e, n) {
          return [
            I(D(n)),
            I(f(t).toString(16)),
            I(f(r).toString(16)),
            I(f(e).toString(16)),
          ].join("");
        }
        function v(t, r) {
          r = 0 === r ? 0 : r || 10;
          var e = c(t).toHsl();
          return (e.s -= r / 100), (e.s = P(e.s)), c(e);
        }
        function m(t, r) {
          r = 0 === r ? 0 : r || 10;
          var e = c(t).toHsl();
          return (e.s += r / 100), (e.s = P(e.s)), c(e);
        }
        function _(t) {
          return c(t).desaturate(100);
        }
        function y(t, r) {
          r = 0 === r ? 0 : r || 10;
          var e = c(t).toHsl();
          return (e.l += r / 100), (e.l = P(e.l)), c(e);
        }
        function A(t, r) {
          r = 0 === r ? 0 : r || 10;
          var e = c(t).toRgb();
          return (
            (e.r = l(0, u(255, e.r - f((-r / 100) * 255)))),
            (e.g = l(0, u(255, e.g - f((-r / 100) * 255)))),
            (e.b = l(0, u(255, e.b - f((-r / 100) * 255)))),
            c(e)
          );
        }
        function x(t, r) {
          r = 0 === r ? 0 : r || 10;
          var e = c(t).toHsl();
          return (e.l -= r / 100), (e.l = P(e.l)), c(e);
        }
        function w(t, r) {
          var e = c(t).toHsl(),
            n = (e.h + r) % 360;
          return (e.h = n < 0 ? 360 + n : n), c(e);
        }
        function S(t) {
          var r = c(t).toHsl();
          return (r.h = (r.h + 180) % 360), c(r);
        }
        function k(t) {
          var r = c(t).toHsl(),
            e = r.h;
          return [
            c(t),
            c({ h: (e + 120) % 360, s: r.s, l: r.l }),
            c({ h: (e + 240) % 360, s: r.s, l: r.l }),
          ];
        }
        function H(t) {
          var r = c(t).toHsl(),
            e = r.h;
          return [
            c(t),
            c({ h: (e + 90) % 360, s: r.s, l: r.l }),
            c({ h: (e + 180) % 360, s: r.s, l: r.l }),
            c({ h: (e + 270) % 360, s: r.s, l: r.l }),
          ];
        }
        function F(t) {
          var r = c(t).toHsl(),
            e = r.h;
          return [
            c(t),
            c({ h: (e + 72) % 360, s: r.s, l: r.l }),
            c({ h: (e + 216) % 360, s: r.s, l: r.l }),
          ];
        }
        function C(t, r, e) {
          (r = r || 6), (e = e || 30);
          var n = c(t).toHsl(),
            a = 360 / e,
            i = [c(t)];
          for (n.h = (n.h - ((a * r) >> 1) + 720) % 360; --r; )
            (n.h = (n.h + a) % 360), i.push(c(n));
          return i;
        }
        function R(t, r) {
          r = r || 6;
          for (
            var e = c(t).toHsv(), n = e.h, a = e.s, i = e.v, o = [], s = 1 / r;
            r--;

          )
            o.push(c({ h: n, s: a, v: i })), (i = (i + s) % 1);
          return o;
        }
        (c.prototype = {
          isDark: function () {
            return this.getBrightness() < 128;
          },
          isLight: function () {
            return !this.isDark();
          },
          isValid: function () {
            return this._ok;
          },
          getOriginalInput: function () {
            return this._originalInput;
          },
          getFormat: function () {
            return this._format;
          },
          getAlpha: function () {
            return this._a;
          },
          getBrightness: function () {
            var t = this.toRgb();
            return (299 * t.r + 587 * t.g + 114 * t.b) / 1e3;
          },
          getLuminance: function () {
            var t,
              r,
              e,
              n = this.toRgb();
            return (
              (t = n.r / 255),
              (r = n.g / 255),
              (e = n.b / 255),
              0.2126 *
                (t <= 0.03928 ? t / 12.92 : a.pow((t + 0.055) / 1.055, 2.4)) +
                0.7152 *
                  (r <= 0.03928 ? r / 12.92 : a.pow((r + 0.055) / 1.055, 2.4)) +
                0.0722 *
                  (e <= 0.03928 ? e / 12.92 : a.pow((e + 0.055) / 1.055, 2.4))
            );
          },
          setAlpha: function (t) {
            return (
              (this._a = j(t)), (this._roundA = f(100 * this._a) / 100), this
            );
          },
          toHsv: function () {
            var t = g(this._r, this._g, this._b);
            return { h: 360 * t.h, s: t.s, v: t.v, a: this._a };
          },
          toHsvString: function () {
            var t = g(this._r, this._g, this._b),
              r = f(360 * t.h),
              e = f(100 * t.s),
              n = f(100 * t.v);
            return 1 == this._a
              ? "hsv(" + r + ", " + e + "%, " + n + "%)"
              : "hsva(" + r + ", " + e + "%, " + n + "%, " + this._roundA + ")";
          },
          toHsl: function () {
            var t = d(this._r, this._g, this._b);
            return { h: 360 * t.h, s: t.s, l: t.l, a: this._a };
          },
          toHslString: function () {
            var t = d(this._r, this._g, this._b),
              r = f(360 * t.h),
              e = f(100 * t.s),
              n = f(100 * t.l);
            return 1 == this._a
              ? "hsl(" + r + ", " + e + "%, " + n + "%)"
              : "hsla(" + r + ", " + e + "%, " + n + "%, " + this._roundA + ")";
          },
          toHex: function (t) {
            return b(this._r, this._g, this._b, t);
          },
          toHexString: function (t) {
            return "#" + this.toHex(t);
          },
          toHex8: function (t) {
            return (function (t, r, e, n, a) {
              var i = [
                I(f(t).toString(16)),
                I(f(r).toString(16)),
                I(f(e).toString(16)),
                I(D(n)),
              ];
              if (
                a &&
                i[0].charAt(0) == i[0].charAt(1) &&
                i[1].charAt(0) == i[1].charAt(1) &&
                i[2].charAt(0) == i[2].charAt(1) &&
                i[3].charAt(0) == i[3].charAt(1)
              )
                return (
                  i[0].charAt(0) +
                  i[1].charAt(0) +
                  i[2].charAt(0) +
                  i[3].charAt(0)
                );
              return i.join("");
            })(this._r, this._g, this._b, this._a, t);
          },
          toHex8String: function (t) {
            return "#" + this.toHex8(t);
          },
          toRgb: function () {
            return { r: f(this._r), g: f(this._g), b: f(this._b), a: this._a };
          },
          toRgbString: function () {
            return 1 == this._a
              ? "rgb(" +
                  f(this._r) +
                  ", " +
                  f(this._g) +
                  ", " +
                  f(this._b) +
                  ")"
              : "rgba(" +
                  f(this._r) +
                  ", " +
                  f(this._g) +
                  ", " +
                  f(this._b) +
                  ", " +
                  this._roundA +
                  ")";
          },
          toPercentageRgb: function () {
            return {
              r: f(100 * E(this._r, 255)) + "%",
              g: f(100 * E(this._g, 255)) + "%",
              b: f(100 * E(this._b, 255)) + "%",
              a: this._a,
            };
          },
          toPercentageRgbString: function () {
            return 1 == this._a
              ? "rgb(" +
                  f(100 * E(this._r, 255)) +
                  "%, " +
                  f(100 * E(this._g, 255)) +
                  "%, " +
                  f(100 * E(this._b, 255)) +
                  "%)"
              : "rgba(" +
                  f(100 * E(this._r, 255)) +
                  "%, " +
                  f(100 * E(this._g, 255)) +
                  "%, " +
                  f(100 * E(this._b, 255)) +
                  "%, " +
                  this._roundA +
                  ")";
          },
          toName: function () {
            return 0 === this._a
              ? "transparent"
              : !(this._a < 1) && (O[b(this._r, this._g, this._b, !0)] || !1);
          },
          toFilter: function (t) {
            var r = "#" + p(this._r, this._g, this._b, this._a),
              e = r,
              n = this._gradientType ? "GradientType = 1, " : "";
            if (t) {
              var a = c(t);
              e = "#" + p(a._r, a._g, a._b, a._a);
            }
            return (
              "progid:DXImageTransform.Microsoft.gradient(" +
              n +
              "startColorstr=" +
              r +
              ",endColorstr=" +
              e +
              ")"
            );
          },
          toString: function (t) {
            var r = !!t;
            t = t || this._format;
            var e = !1,
              n = this._a < 1 && this._a >= 0;
            return r ||
              !n ||
              ("hex" !== t &&
                "hex6" !== t &&
                "hex3" !== t &&
                "hex4" !== t &&
                "hex8" !== t &&
                "name" !== t)
              ? ("rgb" === t && (e = this.toRgbString()),
                "prgb" === t && (e = this.toPercentageRgbString()),
                ("hex" !== t && "hex6" !== t) || (e = this.toHexString()),
                "hex3" === t && (e = this.toHexString(!0)),
                "hex4" === t && (e = this.toHex8String(!0)),
                "hex8" === t && (e = this.toHex8String()),
                "name" === t && (e = this.toName()),
                "hsl" === t && (e = this.toHslString()),
                "hsv" === t && (e = this.toHsvString()),
                e || this.toHexString())
              : "name" === t && 0 === this._a
              ? this.toName()
              : this.toRgbString();
          },
          clone: function () {
            return c(this.toString());
          },
          _applyModification: function (t, r) {
            var e = t.apply(null, [this].concat([].slice.call(r)));
            return (
              (this._r = e._r),
              (this._g = e._g),
              (this._b = e._b),
              this.setAlpha(e._a),
              this
            );
          },
          lighten: function () {
            return this._applyModification(y, arguments);
          },
          brighten: function () {
            return this._applyModification(A, arguments);
          },
          darken: function () {
            return this._applyModification(x, arguments);
          },
          desaturate: function () {
            return this._applyModification(v, arguments);
          },
          saturate: function () {
            return this._applyModification(m, arguments);
          },
          greyscale: function () {
            return this._applyModification(_, arguments);
          },
          spin: function () {
            return this._applyModification(w, arguments);
          },
          _applyCombination: function (t, r) {
            return t.apply(null, [this].concat([].slice.call(r)));
          },
          analogous: function () {
            return this._applyCombination(C, arguments);
          },
          complement: function () {
            return this._applyCombination(S, arguments);
          },
          monochromatic: function () {
            return this._applyCombination(R, arguments);
          },
          splitcomplement: function () {
            return this._applyCombination(F, arguments);
          },
          triad: function () {
            return this._applyCombination(k, arguments);
          },
          tetrad: function () {
            return this._applyCombination(H, arguments);
          },
        }),
          (c.fromRatio = function (t, r) {
            if ("object" == typeof t) {
              var e = {};
              for (var n in t)
                t.hasOwnProperty(n) && (e[n] = "a" === n ? t[n] : q(t[n]));
              t = e;
            }
            return c(t, r);
          }),
          (c.equals = function (t, r) {
            return !(!t || !r) && c(t).toRgbString() == c(r).toRgbString();
          }),
          (c.random = function () {
            return c.fromRatio({ r: h(), g: h(), b: h() });
          }),
          (c.mix = function (t, r, e) {
            e = 0 === e ? 0 : e || 50;
            var n = c(t).toRgb(),
              a = c(r).toRgb(),
              i = e / 100;
            return c({
              r: (a.r - n.r) * i + n.r,
              g: (a.g - n.g) * i + n.g,
              b: (a.b - n.b) * i + n.b,
              a: (a.a - n.a) * i + n.a,
            });
          }),
          (c.readability = function (t, r) {
            var e = c(t),
              n = c(r);
            return (
              (a.max(e.getLuminance(), n.getLuminance()) + 0.05) /
              (a.min(e.getLuminance(), n.getLuminance()) + 0.05)
            );
          }),
          (c.isReadable = function (t, r, e) {
            var n,
              a,
              i = c.readability(t, r);
            switch (
              ((a = !1),
              (n = (function (t) {
                var r, e;
                (r = (
                  (t = t || { level: "AA", size: "small" }).level || "AA"
                ).toUpperCase()),
                  (e = (t.size || "small").toLowerCase()),
                  "AA" !== r && "AAA" !== r && (r = "AA");
                "small" !== e && "large" !== e && (e = "small");
                return { level: r, size: e };
              })(e)).level + n.size)
            ) {
              case "AAsmall":
              case "AAAlarge":
                a = i >= 4.5;
                break;
              case "AAlarge":
                a = i >= 3;
                break;
              case "AAAsmall":
                a = i >= 7;
            }
            return a;
          }),
          (c.mostReadable = function (t, r, e) {
            var n,
              a,
              i,
              o,
              s = null,
              f = 0;
            (a = (e = e || {}).includeFallbackColors),
              (i = e.level),
              (o = e.size);
            for (var u = 0; u < r.length; u++)
              (n = c.readability(t, r[u])) > f && ((f = n), (s = c(r[u])));
            return c.isReadable(t, s, { level: i, size: o }) || !a
              ? s
              : ((e.includeFallbackColors = !1),
                c.mostReadable(t, ["#fff", "#000"], e));
          });
        var M = (c.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            rebeccapurple: "663399",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32",
          }),
          O = (c.hexNames = (function (t) {
            var r = {};
            for (var e in t) t.hasOwnProperty(e) && (r[t[e]] = e);
            return r;
          })(M));
        function j(t) {
          return (
            (t = parseFloat(t)), (isNaN(t) || t < 0 || t > 1) && (t = 1), t
          );
        }
        function E(t, r) {
          (function (t) {
            return (
              "string" == typeof t &&
              -1 != t.indexOf(".") &&
              1 === parseFloat(t)
            );
          })(t) && (t = "100%");
          var e = (function (t) {
            return "string" == typeof t && -1 != t.indexOf("%");
          })(t);
          return (
            (t = u(r, l(0, parseFloat(t)))),
            e && (t = parseInt(t * r, 10) / 100),
            a.abs(t - r) < 1e-6 ? 1 : (t % r) / parseFloat(r)
          );
        }
        function P(t) {
          return u(1, l(0, t));
        }
        function Z(t) {
          return parseInt(t, 16);
        }
        function I(t) {
          return 1 == t.length ? "0" + t : "" + t;
        }
        function q(t) {
          return t <= 1 && (t = 100 * t + "%"), t;
        }
        function D(t) {
          return a.round(255 * parseFloat(t)).toString(16);
        }
        function T(t) {
          return Z(t) / 255;
        }
        var N,
          L,
          z,
          B =
            ((L =
              "[\\s|\\(]+(" +
              (N = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)") +
              ")[,|\\s]+(" +
              N +
              ")[,|\\s]+(" +
              N +
              ")\\s*\\)?"),
            (z =
              "[\\s|\\(]+(" +
              N +
              ")[,|\\s]+(" +
              N +
              ")[,|\\s]+(" +
              N +
              ")[,|\\s]+(" +
              N +
              ")\\s*\\)?"),
            {
              CSS_UNIT: new RegExp(N),
              rgb: new RegExp("rgb" + L),
              rgba: new RegExp("rgba" + z),
              hsl: new RegExp("hsl" + L),
              hsla: new RegExp("hsla" + z),
              hsv: new RegExp("hsv" + L),
              hsva: new RegExp("hsva" + z),
              hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
              hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
              hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
              hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            });
        function $(t) {
          return !!B.CSS_UNIT.exec(t);
        }
        t.exports
          ? (t.exports = c)
          : void 0 ===
              (n = function () {
                return c;
              }.call(r, e, r, t)) || (t.exports = n);
      })(Math);
    },
  },
]);
