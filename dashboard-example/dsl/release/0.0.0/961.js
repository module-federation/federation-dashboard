(window.webpackJsonp_dashboard_dsl =
  window.webpackJsonp_dashboard_dsl || []).push([
  [961],
  {
    97111: (e) => {
      e.exports = function (e, t) {
        (e.prototype = Object.create(t.prototype)),
          (e.prototype.constructor = e),
          (e.__proto__ = t);
      };
    },
    4961: (e, t, r) => {
      "use strict";
      r.r(t),
        r.d(t, {
          css: () => E,
          CacheProvider: () => z,
          ClassNames: () => L,
          Global: () => I,
          ThemeContext: () => S,
          jsx: () => M,
          keyframes: () => T,
          withEmotionCache: () => N,
        });
      var a = r(97111),
        n = r.n(a),
        s = r(10456);
      var i = (function () {
        function e(e) {
          (this.isSpeedy = void 0 === e.speedy || e.speedy),
            (this.tags = []),
            (this.ctr = 0),
            (this.nonce = e.nonce),
            (this.key = e.key),
            (this.container = e.container),
            (this.before = null);
        }
        var t = e.prototype;
        return (
          (t.insert = function (e) {
            if (this.ctr % (this.isSpeedy ? 65e3 : 1) == 0) {
              var t,
                r = (function (e) {
                  var t = document.createElement("style");
                  return (
                    t.setAttribute("data-emotion", e.key),
                    void 0 !== e.nonce && t.setAttribute("nonce", e.nonce),
                    t.appendChild(document.createTextNode("")),
                    t
                  );
                })(this);
              (t =
                0 === this.tags.length
                  ? this.before
                  : this.tags[this.tags.length - 1].nextSibling),
                this.container.insertBefore(r, t),
                this.tags.push(r);
            }
            var a = this.tags[this.tags.length - 1];
            if (this.isSpeedy) {
              var n = (function (e) {
                if (e.sheet) return e.sheet;
                for (var t = 0; t < document.styleSheets.length; t++)
                  if (document.styleSheets[t].ownerNode === e)
                    return document.styleSheets[t];
              })(a);
              try {
                var s = 105 === e.charCodeAt(1) && 64 === e.charCodeAt(0);
                n.insertRule(e, s ? 0 : n.cssRules.length);
              } catch (e) {
                0;
              }
            } else a.appendChild(document.createTextNode(e));
            this.ctr++;
          }),
          (t.flush = function () {
            this.tags.forEach(function (e) {
              return e.parentNode.removeChild(e);
            }),
              (this.tags = []),
              (this.ctr = 0);
          }),
          e
        );
      })();
      const c = function (e) {
        function t(e, t, a) {
          var n = t.trim().split(p);
          t = n;
          var s = n.length,
            i = e.length;
          switch (i) {
            case 0:
            case 1:
              var c = 0;
              for (e = 0 === i ? "" : e[0] + " "; c < s; ++c)
                t[c] = r(e, t[c], a).trim();
              break;
            default:
              var o = (c = 0);
              for (t = []; c < s; ++c)
                for (var l = 0; l < i; ++l)
                  t[o++] = r(e[l] + " ", n[c], a).trim();
          }
          return t;
        }
        function r(e, t, r) {
          var a = t.charCodeAt(0);
          switch ((33 > a && (a = (t = t.trim()).charCodeAt(0)), a)) {
            case 38:
              return t.replace(b, "$1" + e.trim());
            case 58:
              return e.trim() + t.replace(b, "$1" + e.trim());
            default:
              if (0 < 1 * r && 0 < t.indexOf("\f"))
                return t.replace(
                  b,
                  (58 === e.charCodeAt(0) ? "" : "$1") + e.trim()
                );
          }
          return e + t;
        }
        function a(e, t, r, s) {
          var i = e + ";",
            c = 2 * t + 3 * r + 4 * s;
          if (944 === c) {
            e = i.indexOf(":", 9) + 1;
            var o = i.substring(e, i.length - 1).trim();
            return (
              (o = i.substring(0, e).trim() + o + ";"),
              1 === z || (2 === z && n(o, 1)) ? "-webkit-" + o + o : o
            );
          }
          if (0 === z || (2 === z && !n(i, 1))) return i;
          switch (c) {
            case 1015:
              return 97 === i.charCodeAt(10) ? "-webkit-" + i + i : i;
            case 951:
              return 116 === i.charCodeAt(3) ? "-webkit-" + i + i : i;
            case 963:
              return 110 === i.charCodeAt(5) ? "-webkit-" + i + i : i;
            case 1009:
              if (100 !== i.charCodeAt(4)) break;
            case 969:
            case 942:
              return "-webkit-" + i + i;
            case 978:
              return "-webkit-" + i + "-moz-" + i + i;
            case 1019:
            case 983:
              return "-webkit-" + i + "-moz-" + i + "-ms-" + i + i;
            case 883:
              if (45 === i.charCodeAt(8)) return "-webkit-" + i + i;
              if (0 < i.indexOf("image-set(", 11))
                return i.replace(_, "$1-webkit-$2") + i;
              break;
            case 932:
              if (45 === i.charCodeAt(4))
                switch (i.charCodeAt(5)) {
                  case 103:
                    return (
                      "-webkit-box-" +
                      i.replace("-grow", "") +
                      "-webkit-" +
                      i +
                      "-ms-" +
                      i.replace("grow", "positive") +
                      i
                    );
                  case 115:
                    return (
                      "-webkit-" +
                      i +
                      "-ms-" +
                      i.replace("shrink", "negative") +
                      i
                    );
                  case 98:
                    return (
                      "-webkit-" +
                      i +
                      "-ms-" +
                      i.replace("basis", "preferred-size") +
                      i
                    );
                }
              return "-webkit-" + i + "-ms-" + i + i;
            case 964:
              return "-webkit-" + i + "-ms-flex-" + i + i;
            case 1023:
              if (99 !== i.charCodeAt(8)) break;
              return (
                "-webkit-box-pack" +
                (o = i
                  .substring(i.indexOf(":", 15))
                  .replace("flex-", "")
                  .replace("space-between", "justify")) +
                "-webkit-" +
                i +
                "-ms-flex-pack" +
                o +
                i
              );
            case 1005:
              return f.test(i)
                ? i.replace(h, ":-webkit-") + i.replace(h, ":-moz-") + i
                : i;
            case 1e3:
              switch (
                ((t = (o = i.substring(13).trim()).indexOf("-") + 1),
                o.charCodeAt(0) + o.charCodeAt(t))
              ) {
                case 226:
                  o = i.replace(k, "tb");
                  break;
                case 232:
                  o = i.replace(k, "tb-rl");
                  break;
                case 220:
                  o = i.replace(k, "lr");
                  break;
                default:
                  return i;
              }
              return "-webkit-" + i + "-ms-" + o + i;
            case 1017:
              if (-1 === i.indexOf("sticky", 9)) break;
            case 975:
              switch (
                ((t = (i = e).length - 10),
                (c =
                  (o = (33 === i.charCodeAt(t) ? i.substring(0, t) : i)
                    .substring(e.indexOf(":", 7) + 1)
                    .trim()).charCodeAt(0) +
                  (0 | o.charCodeAt(7))))
              ) {
                case 203:
                  if (111 > o.charCodeAt(8)) break;
                case 115:
                  i = i.replace(o, "-webkit-" + o) + ";" + i;
                  break;
                case 207:
                case 102:
                  i =
                    i.replace(
                      o,
                      "-webkit-" + (102 < c ? "inline-" : "") + "box"
                    ) +
                    ";" +
                    i.replace(o, "-webkit-" + o) +
                    ";" +
                    i.replace(o, "-ms-" + o + "box") +
                    ";" +
                    i;
              }
              return i + ";";
            case 938:
              if (45 === i.charCodeAt(5))
                switch (i.charCodeAt(6)) {
                  case 105:
                    return (
                      (o = i.replace("-items", "")),
                      "-webkit-" + i + "-webkit-box-" + o + "-ms-flex-" + o + i
                    );
                  case 115:
                    return (
                      "-webkit-" + i + "-ms-flex-item-" + i.replace(C, "") + i
                    );
                  default:
                    return (
                      "-webkit-" +
                      i +
                      "-ms-flex-line-pack" +
                      i.replace("align-content", "").replace(C, "") +
                      i
                    );
                }
              break;
            case 973:
            case 989:
              if (45 !== i.charCodeAt(3) || 122 === i.charCodeAt(4)) break;
            case 931:
            case 953:
              if (!0 === x.test(e))
                return 115 ===
                  (o = e.substring(e.indexOf(":") + 1)).charCodeAt(0)
                  ? a(e.replace("stretch", "fill-available"), t, r, s).replace(
                      ":fill-available",
                      ":stretch"
                    )
                  : i.replace(o, "-webkit-" + o) +
                      i.replace(o, "-moz-" + o.replace("fill-", "")) +
                      i;
              break;
            case 962:
              if (
                ((i =
                  "-webkit-" +
                  i +
                  (102 === i.charCodeAt(5) ? "-ms-" + i : "") +
                  i),
                211 === r + s &&
                  105 === i.charCodeAt(13) &&
                  0 < i.indexOf("transform", 10))
              )
                return (
                  i
                    .substring(0, i.indexOf(";", 27) + 1)
                    .replace(d, "$1-webkit-$2") + i
                );
          }
          return i;
        }
        function n(e, t) {
          var r = e.indexOf(1 === t ? ":" : "{"),
            a = e.substring(0, 3 !== t ? r : 10);
          return (
            (r = e.substring(r + 1, e.length - 1)),
            R(2 !== t ? a : a.replace(A, "$1"), r, t)
          );
        }
        function s(e, t) {
          var r = a(t, t.charCodeAt(0), t.charCodeAt(1), t.charCodeAt(2));
          return r !== t + ";"
            ? r.replace(y, " or ($1)").substring(4)
            : "(" + t + ")";
        }
        function i(e, t, r, a, n, s, i, c, l, u) {
          for (var h, f = 0, d = t; f < j; ++f)
            switch ((h = $[f].call(o, e, d, r, a, n, s, i, c, l, u))) {
              case void 0:
              case !1:
              case !0:
              case null:
                break;
              default:
                d = h;
            }
          if (d !== t) return d;
        }
        function c(e) {
          return (
            void 0 !== (e = e.prefix) &&
              ((R = null),
              e
                ? "function" != typeof e
                  ? (z = 1)
                  : ((z = 2), (R = e))
                : (z = 0)),
            c
          );
        }
        function o(e, r) {
          var c = e;
          if ((33 > c.charCodeAt(0) && (c = c.trim()), (c = [c]), 0 < j)) {
            var o = i(-1, r, c, c, O, E, 0, 0, 0, 0);
            void 0 !== o && "string" == typeof o && (r = o);
          }
          var h = (function e(r, c, o, h, f) {
            for (
              var d,
                p,
                b,
                k,
                y,
                C = 0,
                A = 0,
                x = 0,
                _ = 0,
                $ = 0,
                R = 0,
                M = (b = d = 0),
                I = 0,
                P = 0,
                T = 0,
                D = 0,
                W = o.length,
                L = W - 1,
                U = "",
                q = "",
                F = "",
                H = "";
              I < W;

            ) {
              if (
                ((p = o.charCodeAt(I)),
                I === L &&
                  0 !== A + _ + x + C &&
                  (0 !== A && (p = 47 === A ? 10 : 47),
                  (_ = x = C = 0),
                  W++,
                  L++),
                0 === A + _ + x + C)
              ) {
                if (
                  I === L &&
                  (0 < P && (U = U.replace(u, "")), 0 < U.trim().length)
                ) {
                  switch (p) {
                    case 32:
                    case 9:
                    case 59:
                    case 13:
                    case 10:
                      break;
                    default:
                      U += o.charAt(I);
                  }
                  p = 59;
                }
                switch (p) {
                  case 123:
                    for (
                      d = (U = U.trim()).charCodeAt(0), b = 1, D = ++I;
                      I < W;

                    ) {
                      switch ((p = o.charCodeAt(I))) {
                        case 123:
                          b++;
                          break;
                        case 125:
                          b--;
                          break;
                        case 47:
                          switch ((p = o.charCodeAt(I + 1))) {
                            case 42:
                            case 47:
                              e: {
                                for (M = I + 1; M < L; ++M)
                                  switch (o.charCodeAt(M)) {
                                    case 47:
                                      if (
                                        42 === p &&
                                        42 === o.charCodeAt(M - 1) &&
                                        I + 2 !== M
                                      ) {
                                        I = M + 1;
                                        break e;
                                      }
                                      break;
                                    case 10:
                                      if (47 === p) {
                                        I = M + 1;
                                        break e;
                                      }
                                  }
                                I = M;
                              }
                          }
                          break;
                        case 91:
                          p++;
                        case 40:
                          p++;
                        case 34:
                        case 39:
                          for (; I++ < L && o.charCodeAt(I) !== p; );
                      }
                      if (0 === b) break;
                      I++;
                    }
                    switch (
                      ((b = o.substring(D, I)),
                      0 === d &&
                        (d = (U = U.replace(l, "").trim()).charCodeAt(0)),
                      d)
                    ) {
                      case 64:
                        switch (
                          (0 < P && (U = U.replace(u, "")),
                          (p = U.charCodeAt(1)))
                        ) {
                          case 100:
                          case 109:
                          case 115:
                          case 45:
                            P = c;
                            break;
                          default:
                            P = N;
                        }
                        if (
                          ((D = (b = e(c, P, b, p, f + 1)).length),
                          0 < j &&
                            ((y = i(
                              3,
                              b,
                              (P = t(N, U, T)),
                              c,
                              O,
                              E,
                              D,
                              p,
                              f,
                              h
                            )),
                            (U = P.join("")),
                            void 0 !== y &&
                              0 === (D = (b = y.trim()).length) &&
                              ((p = 0), (b = ""))),
                          0 < D)
                        )
                          switch (p) {
                            case 115:
                              U = U.replace(w, s);
                            case 100:
                            case 109:
                            case 45:
                              b = U + "{" + b + "}";
                              break;
                            case 107:
                              (b = (U = U.replace(m, "$1 $2")) + "{" + b + "}"),
                                (b =
                                  1 === z || (2 === z && n("@" + b, 3))
                                    ? "@-webkit-" + b + "@" + b
                                    : "@" + b);
                              break;
                            default:
                              (b = U + b), 112 === h && ((q += b), (b = ""));
                          }
                        else b = "";
                        break;
                      default:
                        b = e(c, t(c, U, T), b, h, f + 1);
                    }
                    (F += b),
                      (b = T = P = M = d = 0),
                      (U = ""),
                      (p = o.charCodeAt(++I));
                    break;
                  case 125:
                  case 59:
                    if (
                      1 <
                      (D = (U = (0 < P ? U.replace(u, "") : U).trim()).length)
                    )
                      switch (
                        (0 === M &&
                          ((d = U.charCodeAt(0)),
                          45 === d || (96 < d && 123 > d)) &&
                          (D = (U = U.replace(" ", ":")).length),
                        0 < j &&
                          void 0 !==
                            (y = i(1, U, c, r, O, E, q.length, h, f, h)) &&
                          0 === (D = (U = y.trim()).length) &&
                          (U = "\0\0"),
                        (d = U.charCodeAt(0)),
                        (p = U.charCodeAt(1)),
                        d)
                      ) {
                        case 0:
                          break;
                        case 64:
                          if (105 === p || 99 === p) {
                            H += U + o.charAt(I);
                            break;
                          }
                        default:
                          58 !== U.charCodeAt(D - 1) &&
                            (q += a(U, d, p, U.charCodeAt(2)));
                      }
                    (T = P = M = d = 0), (U = ""), (p = o.charCodeAt(++I));
                }
              }
              switch (p) {
                case 13:
                case 10:
                  47 === A
                    ? (A = 0)
                    : 0 === 1 + d &&
                      107 !== h &&
                      0 < U.length &&
                      ((P = 1), (U += "\0")),
                    0 < j * G && i(0, U, c, r, O, E, q.length, h, f, h),
                    (E = 1),
                    O++;
                  break;
                case 59:
                case 125:
                  if (0 === A + _ + x + C) {
                    E++;
                    break;
                  }
                default:
                  switch ((E++, (k = o.charAt(I)), p)) {
                    case 9:
                    case 32:
                      if (0 === _ + C + A)
                        switch ($) {
                          case 44:
                          case 58:
                          case 9:
                          case 32:
                            k = "";
                            break;
                          default:
                            32 !== p && (k = " ");
                        }
                      break;
                    case 0:
                      k = "\\0";
                      break;
                    case 12:
                      k = "\\f";
                      break;
                    case 11:
                      k = "\\v";
                      break;
                    case 38:
                      0 === _ + A + C && ((P = T = 1), (k = "\f" + k));
                      break;
                    case 108:
                      if (0 === _ + A + C + S && 0 < M)
                        switch (I - M) {
                          case 2:
                            112 === $ && 58 === o.charCodeAt(I - 3) && (S = $);
                          case 8:
                            111 === R && (S = R);
                        }
                      break;
                    case 58:
                      0 === _ + A + C && (M = I);
                      break;
                    case 44:
                      0 === A + x + _ + C && ((P = 1), (k += "\r"));
                      break;
                    case 34:
                    case 39:
                      0 === A && (_ = _ === p ? 0 : 0 === _ ? p : _);
                      break;
                    case 91:
                      0 === _ + A + x && C++;
                      break;
                    case 93:
                      0 === _ + A + x && C--;
                      break;
                    case 41:
                      0 === _ + A + C && x--;
                      break;
                    case 40:
                      if (0 === _ + A + C) {
                        if (0 === d)
                          switch (2 * $ + 3 * R) {
                            case 533:
                              break;
                            default:
                              d = 1;
                          }
                        x++;
                      }
                      break;
                    case 64:
                      0 === A + x + _ + C + M + b && (b = 1);
                      break;
                    case 42:
                    case 47:
                      if (!(0 < _ + C + x))
                        switch (A) {
                          case 0:
                            switch (2 * p + 3 * o.charCodeAt(I + 1)) {
                              case 235:
                                A = 47;
                                break;
                              case 220:
                                (D = I), (A = 42);
                            }
                            break;
                          case 42:
                            47 === p &&
                              42 === $ &&
                              D + 2 !== I &&
                              (33 === o.charCodeAt(D + 2) &&
                                (q += o.substring(D, I + 1)),
                              (k = ""),
                              (A = 0));
                        }
                  }
                  0 === A && (U += k);
              }
              (R = $), ($ = p), I++;
            }
            if (0 < (D = q.length)) {
              if (
                ((P = c),
                0 < j &&
                  void 0 !== (y = i(2, q, P, r, O, E, D, h, f, h)) &&
                  0 === (q = y).length)
              )
                return H + q + F;
              if (((q = P.join(",") + "{" + q + "}"), 0 != z * S)) {
                switch ((2 !== z || n(q, 2) || (S = 0), S)) {
                  case 111:
                    q = q.replace(g, ":-moz-$1") + q;
                    break;
                  case 112:
                    q =
                      q.replace(v, "::-webkit-input-$1") +
                      q.replace(v, "::-moz-$1") +
                      q.replace(v, ":-ms-input-$1") +
                      q;
                }
                S = 0;
              }
            }
            return H + q + F;
          })(N, c, r, 0, 0);
          return (
            0 < j &&
              void 0 !== (o = i(-2, h, c, c, O, E, h.length, 0, 0, 0)) &&
              (h = o),
            "",
            (S = 0),
            (E = O = 1),
            h
          );
        }
        var l = /^\0+/g,
          u = /[\0\r\f]/g,
          h = /: */g,
          f = /zoo|gra/,
          d = /([,: ])(transform)/g,
          p = /,\r+?/g,
          b = /([\t\r\n ])*\f?&/g,
          m = /@(k\w+)\s*(\S*)\s*/,
          v = /::(place)/g,
          g = /:(read-only)/g,
          k = /[svh]\w+-[tblr]{2}/,
          w = /\(\s*(.*)\s*\)/g,
          y = /([\s\S]*?);/g,
          C = /-self|flex-/g,
          A = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
          x = /stretch|:\s*\w+\-(?:conte|avail)/,
          _ = /([^-])(image-set\()/,
          E = 1,
          O = 1,
          S = 0,
          z = 1,
          N = [],
          $ = [],
          j = 0,
          R = null,
          G = 0;
        return (
          (o.use = function e(t) {
            switch (t) {
              case void 0:
              case null:
                j = $.length = 0;
                break;
              default:
                if ("function" == typeof t) $[j++] = t;
                else if ("object" == typeof t)
                  for (var r = 0, a = t.length; r < a; ++r) e(t[r]);
                else G = 0 | !!t;
            }
            return e;
          }),
          (o.set = c),
          void 0 !== e && c(e),
          o
        );
      };
      function o(e) {
        e && l.current.insert(e + "}");
      }
      var l = { current: null },
        u = function (e, t, r, a, n, s, i, c, u, h) {
          switch (e) {
            case 1:
              switch (t.charCodeAt(0)) {
                case 64:
                  return l.current.insert(t + ";"), "";
                case 108:
                  if (98 === t.charCodeAt(2)) return "";
              }
              break;
            case 2:
              if (0 === c) return t + "/*|*/";
              break;
            case 3:
              switch (c) {
                case 102:
                case 112:
                  return l.current.insert(r[0] + t), "";
                default:
                  return t + (0 === h ? "/*|*/" : "");
              }
            case -2:
              t.split("/*|*/}").forEach(o);
          }
        };
      const h = function (e) {
        void 0 === e && (e = {});
        var t,
          r = e.key || "css";
        void 0 !== e.prefix && (t = { prefix: e.prefix });
        var a = new c(t);
        var n,
          s = {};
        n = e.container || document.head;
        var o,
          h = document.querySelectorAll("style[data-emotion-" + r + "]");
        Array.prototype.forEach.call(h, function (e) {
          e
            .getAttribute("data-emotion-" + r)
            .split(" ")
            .forEach(function (e) {
              s[e] = !0;
            }),
            e.parentNode !== n && n.appendChild(e);
        }),
          a.use(e.stylisPlugins)(u),
          (o = function (e, t, r, n) {
            var s = t.name;
            (l.current = r), a(e, t.styles), n && (f.inserted[s] = !0);
          });
        var f = {
          key: r,
          sheet: new i({
            key: r,
            container: n,
            nonce: e.nonce,
            speedy: e.speedy,
          }),
          nonce: e.nonce,
          inserted: s,
          registered: {},
          insert: o,
        };
        return f;
      };
      function f(e, t, r) {
        var a = "";
        return (
          r.split(" ").forEach(function (r) {
            void 0 !== e[r] ? t.push(e[r]) : (a += r + " ");
          }),
          a
        );
      }
      var d = function (e, t, r) {
        var a = e.key + "-" + t.name;
        if (
          (!1 === r &&
            void 0 === e.registered[a] &&
            (e.registered[a] = t.styles),
          void 0 === e.inserted[t.name])
        ) {
          var n = t;
          do {
            e.insert("." + a, n, e.sheet, !0);
            n = n.next;
          } while (void 0 !== n);
        }
      };
      const p = function (e) {
        for (var t, r = 0, a = 0, n = e.length; n >= 4; ++a, n -= 4)
          (t =
            1540483477 *
              (65535 &
                (t =
                  (255 & e.charCodeAt(a)) |
                  ((255 & e.charCodeAt(++a)) << 8) |
                  ((255 & e.charCodeAt(++a)) << 16) |
                  ((255 & e.charCodeAt(++a)) << 24))) +
            ((59797 * (t >>> 16)) << 16)),
            (r =
              (1540483477 * (65535 & (t ^= t >>> 24)) +
                ((59797 * (t >>> 16)) << 16)) ^
              (1540483477 * (65535 & r) + ((59797 * (r >>> 16)) << 16)));
        switch (n) {
          case 3:
            r ^= (255 & e.charCodeAt(a + 2)) << 16;
          case 2:
            r ^= (255 & e.charCodeAt(a + 1)) << 8;
          case 1:
            r =
              1540483477 * (65535 & (r ^= 255 & e.charCodeAt(a))) +
              ((59797 * (r >>> 16)) << 16);
        }
        return (
          ((r =
            1540483477 * (65535 & (r ^= r >>> 13)) +
            ((59797 * (r >>> 16)) << 16)) ^
            (r >>> 15)) >>>
          0
        ).toString(36);
      };
      const b = {
        animationIterationCount: 1,
        borderImageOutset: 1,
        borderImageSlice: 1,
        borderImageWidth: 1,
        boxFlex: 1,
        boxFlexGroup: 1,
        boxOrdinalGroup: 1,
        columnCount: 1,
        columns: 1,
        flex: 1,
        flexGrow: 1,
        flexPositive: 1,
        flexShrink: 1,
        flexNegative: 1,
        flexOrder: 1,
        gridRow: 1,
        gridRowEnd: 1,
        gridRowSpan: 1,
        gridRowStart: 1,
        gridColumn: 1,
        gridColumnEnd: 1,
        gridColumnSpan: 1,
        gridColumnStart: 1,
        msGridRow: 1,
        msGridRowSpan: 1,
        msGridColumn: 1,
        msGridColumnSpan: 1,
        fontWeight: 1,
        lineHeight: 1,
        opacity: 1,
        order: 1,
        orphans: 1,
        tabSize: 1,
        widows: 1,
        zIndex: 1,
        zoom: 1,
        WebkitLineClamp: 1,
        fillOpacity: 1,
        floodOpacity: 1,
        stopOpacity: 1,
        strokeDasharray: 1,
        strokeDashoffset: 1,
        strokeMiterlimit: 1,
        strokeOpacity: 1,
        strokeWidth: 1,
      };
      var m = /[A-Z]|^ms/g,
        v = /_EMO_([^_]+?)_([^]*?)_EMO_/g,
        g = function (e) {
          return 45 === e.charCodeAt(1);
        },
        k = function (e) {
          return null != e && "boolean" != typeof e;
        },
        w = (function (e) {
          var t = {};
          return function (r) {
            return void 0 === t[r] && (t[r] = e(r)), t[r];
          };
        })(function (e) {
          return g(e) ? e : e.replace(m, "-$&").toLowerCase();
        }),
        y = function (e, t) {
          switch (e) {
            case "animation":
            case "animationName":
              if ("string" == typeof t)
                return t.replace(v, function (e, t, r) {
                  return (A = { name: t, styles: r, next: A }), t;
                });
          }
          return 1 === b[e] || g(e) || "number" != typeof t || 0 === t
            ? t
            : t + "px";
        };
      function C(e, t, r, a) {
        if (null == r) return "";
        if (void 0 !== r.__emotion_styles) return r;
        switch (typeof r) {
          case "boolean":
            return "";
          case "object":
            if (1 === r.anim)
              return (A = { name: r.name, styles: r.styles, next: A }), r.name;
            if (void 0 !== r.styles) {
              var n = r.next;
              if (void 0 !== n)
                for (; void 0 !== n; )
                  (A = { name: n.name, styles: n.styles, next: A }),
                    (n = n.next);
              return r.styles + ";";
            }
            return (function (e, t, r) {
              var a = "";
              if (Array.isArray(r))
                for (var n = 0; n < r.length; n++) a += C(e, t, r[n], !1);
              else
                for (var s in r) {
                  var i = r[s];
                  if ("object" != typeof i)
                    null != t && void 0 !== t[i]
                      ? (a += s + "{" + t[i] + "}")
                      : k(i) && (a += w(s) + ":" + y(s, i) + ";");
                  else if (
                    !Array.isArray(i) ||
                    "string" != typeof i[0] ||
                    (null != t && void 0 !== t[i[0]])
                  ) {
                    var c = C(e, t, i, !1);
                    switch (s) {
                      case "animation":
                      case "animationName":
                        a += w(s) + ":" + c + ";";
                        break;
                      default:
                        a += s + "{" + c + "}";
                    }
                  } else
                    for (var o = 0; o < i.length; o++)
                      k(i[o]) && (a += w(s) + ":" + y(s, i[o]) + ";");
                }
              return a;
            })(e, t, r);
          case "function":
            if (void 0 !== e) {
              var s = A,
                i = r(e);
              return (A = s), C(e, t, i, a);
            }
            break;
          case "string":
        }
        if (null == t) return r;
        var c = t[r];
        return void 0 === c || a ? r : c;
      }
      var A,
        x = /label:\s*([^\s;\n{]+)\s*;/g;
      var _ = function (e, t, r) {
        if (
          1 === e.length &&
          "object" == typeof e[0] &&
          null !== e[0] &&
          void 0 !== e[0].styles
        )
          return e[0];
        var a = !0,
          n = "";
        A = void 0;
        var s = e[0];
        null == s || void 0 === s.raw
          ? ((a = !1), (n += C(r, t, s, !1)))
          : (n += s[0]);
        for (var i = 1; i < e.length; i++)
          (n += C(r, t, e[i], 46 === n.charCodeAt(n.length - 1))),
            a && (n += s[i]);
        x.lastIndex = 0;
        for (var c, o = ""; null !== (c = x.exec(n)); ) o += "-" + c[1];
        return { name: p(n) + o, styles: n, next: A };
      };
      const E = function () {
        for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
          t[r] = arguments[r];
        return _(t);
      };
      var O = (0, s.createContext)(
          "undefined" != typeof HTMLElement ? h() : null
        ),
        S = (0, s.createContext)({}),
        z = O.Provider,
        N = function (e) {
          return (0, s.forwardRef)(function (t, r) {
            return (0, s.createElement)(O.Consumer, null, function (a) {
              return e(t, a, r);
            });
          });
        },
        $ = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__",
        j = Object.prototype.hasOwnProperty,
        R = function (e, t, r, a) {
          var n = null === r ? t.css : t.css(r);
          "string" == typeof n &&
            void 0 !== e.registered[n] &&
            (n = e.registered[n]);
          var i = t[$],
            c = [n],
            o = "";
          "string" == typeof t.className
            ? (o = f(e.registered, c, t.className))
            : null != t.className && (o = t.className + " ");
          var l = _(c);
          d(e, l, "string" == typeof i);
          o += e.key + "-" + l.name;
          var u = {};
          for (var h in t)
            j.call(t, h) && "css" !== h && h !== $ && (u[h] = t[h]);
          return (u.ref = a), (u.className = o), (0, s.createElement)(i, u);
        },
        G = N(function (e, t, r) {
          return "function" == typeof e.css
            ? (0, s.createElement)(S.Consumer, null, function (a) {
                return R(t, e, a, r);
              })
            : R(t, e, null, r);
        });
      var M = function (e, t) {
          var r = arguments;
          if (null == t || !j.call(t, "css"))
            return s.createElement.apply(void 0, r);
          var a = r.length,
            n = new Array(a);
          n[0] = G;
          var i = {};
          for (var c in t) j.call(t, c) && (i[c] = t[c]);
          (i[$] = e), (n[1] = i);
          for (var o = 2; o < a; o++) n[o] = r[o];
          return s.createElement.apply(null, n);
        },
        I = N(function (e, t) {
          var r = e.styles;
          if ("function" == typeof r)
            return (0, s.createElement)(S.Consumer, null, function (e) {
              var a = _([r(e)]);
              return (0, s.createElement)(P, { serialized: a, cache: t });
            });
          var a = _([r]);
          return (0, s.createElement)(P, { serialized: a, cache: t });
        }),
        P = (function (e) {
          function t(t, r, a) {
            return e.call(this, t, r, a) || this;
          }
          n()(t, e);
          var r = t.prototype;
          return (
            (r.componentDidMount = function () {
              this.sheet = new i({
                key: this.props.cache.key + "-global",
                nonce: this.props.cache.sheet.nonce,
                container: this.props.cache.sheet.container,
              });
              var e = document.querySelector(
                "style[data-emotion-" +
                  this.props.cache.key +
                  '="' +
                  this.props.serialized.name +
                  '"]'
              );
              null !== e && this.sheet.tags.push(e),
                this.props.cache.sheet.tags.length &&
                  (this.sheet.before = this.props.cache.sheet.tags[0]),
                this.insertStyles();
            }),
            (r.componentDidUpdate = function (e) {
              e.serialized.name !== this.props.serialized.name &&
                this.insertStyles();
            }),
            (r.insertStyles = function () {
              if (
                (void 0 !== this.props.serialized.next &&
                  d(this.props.cache, this.props.serialized.next, !0),
                this.sheet.tags.length)
              ) {
                var e = this.sheet.tags[this.sheet.tags.length - 1]
                  .nextElementSibling;
                (this.sheet.before = e), this.sheet.flush();
              }
              this.props.cache.insert(
                "",
                this.props.serialized,
                this.sheet,
                !1
              );
            }),
            (r.componentWillUnmount = function () {
              this.sheet.flush();
            }),
            (r.render = function () {
              return null;
            }),
            t
          );
        })(s.Component),
        T = function () {
          var e = E.apply(void 0, arguments),
            t = "animation-" + e.name;
          return {
            name: t,
            styles: "@keyframes " + t + "{" + e.styles + "}",
            anim: 1,
            toString: function () {
              return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
            },
          };
        },
        D = function e(t) {
          for (var r = t.length, a = 0, n = ""; a < r; a++) {
            var s = t[a];
            if (null != s) {
              var i = void 0;
              switch (typeof s) {
                case "boolean":
                  break;
                case "object":
                  if (Array.isArray(s)) i = e(s);
                  else
                    for (var c in ((i = ""), s))
                      s[c] && c && (i && (i += " "), (i += c));
                  break;
                default:
                  i = s;
              }
              i && (n && (n += " "), (n += i));
            }
          }
          return n;
        };
      function W(e, t, r) {
        var a = [],
          n = f(e, a, r);
        return a.length < 2 ? r : n + t(a);
      }
      var L = N(function (e, t) {
        return (0, s.createElement)(S.Consumer, null, function (r) {
          var a = function () {
              for (
                var e = arguments.length, r = new Array(e), a = 0;
                a < e;
                a++
              )
                r[a] = arguments[a];
              var n = _(r, t.registered);
              return d(t, n, !1), t.key + "-" + n.name;
            },
            n = {
              css: a,
              cx: function () {
                for (
                  var e = arguments.length, r = new Array(e), n = 0;
                  n < e;
                  n++
                )
                  r[n] = arguments[n];
                return W(t.registered, a, D(r));
              },
              theme: r,
            },
            s = e.children(n);
          return !0, s;
        });
      });
    },
  },
]);
