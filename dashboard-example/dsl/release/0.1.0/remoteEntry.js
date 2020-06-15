var dsl;
dsl = (() => {
  "use strict";
  var e,
    r,
    t,
    o,
    n,
    i,
    a,
    s = {
      79098: (e, r, t) => {
        var o = {
            "./Button": () =>
              Promise.all([t.e(456), t.e(722), t.e(84)]).then(() => () =>
                t(79084)
              ),
            "./Carousel": () =>
              Promise.all([t.e(456), t.e(722), t.e(728)]).then(() => () =>
                t(31728)
              ),
            "./TextField": () =>
              Promise.all([t.e(456), t.e(722), t.e(85)]).then(() => () =>
                t(24085)
              ),
          },
          n = (e) =>
            t.o(o, e)
              ? o[e]()
              : Promise.resolve().then(() => {
                  throw new Error(
                    'Module "' + e + '" does not exist in container.'
                  );
                }),
          i = (e) => {
            var r = t.S.default;
            if (r && r !== e)
              throw new Error(
                "Container initialization failed as it has already been initialized with a different share scope"
              );
            return (t.S.default = e), t.I("default");
          };
        t.d(r, { get: () => n, init: () => i });
      },
    },
    l = {};
  function d(e) {
    if (l[e]) return l[e].exports;
    var r = (l[e] = { id: e, loaded: !1, exports: {} });
    return s[e].call(r.exports, r, r.exports, d), (r.loaded = !0), r.exports;
  }
  return (
    (d.m = s),
    (d.n = (e) => {
      var r = e && e.__esModule ? () => e.default : () => e;
      return d.d(r, { a: r }), r;
    }),
    (d.d = (e, r) => {
      for (var t in r)
        d.o(r, t) &&
          !d.o(e, t) &&
          Object.defineProperty(e, t, { enumerable: !0, get: r[t] });
    }),
    (d.f = {}),
    (d.e = (e) =>
      Promise.all(Object.keys(d.f).reduce((r, t) => (d.f[t](e, r), r), []))),
    (d.u = (e) => e + ".js"),
    (d.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (d.o = (e, r) => Object.prototype.hasOwnProperty.call(e, r)),
    (d.r = (e) => {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (d.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
    (d.p =
      "http://localhost:3002/" +
      (window.remote_dsl ? window.remote_dsl + "/" : "")),
    (() => {
      d.S = {};
      var e = {};
      d.I = (r) => {
        if (e[r]) return e[r];
        (e[r] = 1), d.o(d.S, r) || (d.S[r] = {});
        var t = d.S[r],
          o = (e) =>
            "undefined" != typeof console && console.warn && console.warn(e),
          n = (e, r, n, i) => {
            (r = r || []), (i = e);
            var a = () =>
                o(
                  "Version conflict for shared modules: " +
                    e +
                    " " +
                    (v && v.join(".")) +
                    " <=> " +
                    (r && r.join("."))
                ),
              s = () => {
                if (t[i]) {
                  for (
                    var s = t[i].version || [], l = 0;
                    l < r.length && l < s.length;
                    l++
                  )
                    if (s[l] != r[l]) {
                      if ("string" == typeof s[l] || "string" == typeof r[l])
                        return a();
                      if (s[l] > r[l]) return;
                      if (s[l] < r[l]) {
                        l = -1;
                        break;
                      }
                    }
                  if (l >= 0 && r.length <= s.length) return;
                  if (t[i].loaded)
                    return o(
                      "Ignoring providing of already used shared module: " + e
                    );
                }
                t[i] = { get: n, version: r };
              };
            s(),
              r.forEach((e) => {
                (i += "`" + e), s();
              });
          },
          i = [];
        switch (r) {
          case "default":
            n("lodash", [4, 17, 15], () => d.e(635).then(() => () => d(76635))),
              n("@emotion/core", [10, 0, 28], () =>
                Promise.all([d.e(961), d.e(456)]).then(() => () => d(4961))
              ),
              n("antd", [4, 3, 3], () =>
                Promise.all([
                  d.e(584),
                  d.e(414),
                  d.e(456),
                  d.e(136),
                  d.e(506),
                ]).then(() => () => d(51971))
              ),
              n("react", [16, 13, 1], () => d.e(784).then(() => () => d(2784))),
              n("@ant-design/icons", [4, 2, 1], () =>
                Promise.all([d.e(584), d.e(659), d.e(456)]).then(() => () =>
                  d(31659)
                )
              ),
              n("react-dom", [16, 13, 1], () =>
                Promise.all([d.e(316), d.e(456)]).then(() => () => d(28316))
              );
        }
        return i.length && (e[r] = Promise.all(i).then(() => (e[r] = 1)));
      };
    })(),
    (e = (e, r) => {
      for (var t = 0; t < r.length; t++) {
        if (t === e.length) return 1;
        if (e[t] != r[t]) {
          if ("string" == typeof e[t] || "string" == typeof r[t] || e[t] < r[t])
            return 1;
          if (e[t] > r[t]) return;
        }
      }
    }),
    (r = (r, t, o, n) => {
      var i,
        a = t,
        s = (o = o || []).map((e) => (a += "`" + e));
      for (s.unshift(t); (a = s.shift()); )
        if (d.o(r, a) && !e((i = r[a].version || []), o)) return r[a];
      var l =
        "Unsatisfied version of shared module " +
        t +
        "@" +
        (i && i.join(".")) +
        " (required " +
        t +
        "@" +
        o.join(".") +
        ")";
      if (n) throw new Error(l);
      "undefined" != typeof console && console.warn && console.warn(l);
    }),
    (t = (e) => ((e.loaded = 1), e.get())),
    (o = (e, o, n, i) => {
      d.I(e);
      var a = d.S[e],
        s = a && r(a, o, n);
      return s ? t(s) : i();
    }),
    (n = {}),
    (i = {
      10456: () =>
        o("default", "react", ["16", 13, 0], () =>
          d.e(784).then(() => () => d(2784))
        ),
      28722: () =>
        o("default", "antd", ["4", 2, 5], () =>
          Promise.all([d.e(584), d.e(414), d.e(136), d.e(847)]).then(() => () =>
            d(51971)
          )
        ),
      29136: () =>
        o("default", "react-dom", ["16", 13, 0], () =>
          d.e(316).then(() => () => d(28316))
        ),
      18689: () =>
        o("default", "@ant-design/icons", ["4", 1, 0], () =>
          d.e(659).then(() => () => d(31659))
        ),
    }),
    (a = {
      136: [29136],
      456: [10456],
      506: [18689],
      722: [28722],
      847: [18689],
    }),
    (d.f.consumes = (e, r) => {
      d.o(a, e) &&
        a[e].forEach((e) => {
          if (d.o(n, e)) return r.push(n[e]);
          var t = (r) => {
              (n[e] = 0),
                (s[e] = (t) => {
                  delete l[e], (t.exports = r());
                });
            },
            o = (r) => {
              delete n[e],
                (s[e] = (t) => {
                  throw (delete l[e], r);
                });
            };
          try {
            var a = i[e]();
            a.then ? r.push((n[e] = a.then(t).catch(o))) : t(a);
          } catch (e) {
            o(e);
          }
        });
    }),
    (() => {
      var e = { 365: 0 };
      d.f.j = (r, t) => {
        var o = d.o(e, r) ? e[r] : void 0;
        if (0 !== o)
          if (o) t.push(o[2]);
          else if (/^(136|456|722)$/.test(r)) e[r] = 0;
          else {
            var n = new Promise((t, n) => {
              o = e[r] = [t, n];
            });
            t.push((o[2] = n));
            var i,
              a = d.p + d.u(r),
              s = document.createElement("script");
            (s.charset = "utf-8"),
              (s.timeout = 120),
              d.nc && s.setAttribute("nonce", d.nc),
              (s.src = a);
            var l = new Error();
            i = (t) => {
              (i = () => {}), (s.onerror = s.onload = null), clearTimeout(f);
              var n = (() => {
                if (d.o(e, r) && (0 !== (o = e[r]) && (e[r] = void 0), o))
                  return o[1];
              })();
              if (n) {
                var a = t && ("load" === t.type ? "missing" : t.type),
                  u = t && t.target && t.target.src;
                (l.message =
                  "Loading chunk " + r + " failed.\n(" + a + ": " + u + ")"),
                  (l.name = "ChunkLoadError"),
                  (l.type = a),
                  (l.request = u),
                  n(l);
              }
            };
            var f = setTimeout(() => {
              i({ type: "timeout", target: s });
            }, 12e4);
            (s.onerror = s.onload = i), document.head.appendChild(s);
          }
      };
      var r = (window.webpackJsonp_dashboard_dsl =
          window.webpackJsonp_dashboard_dsl || []),
        t = r.push.bind(r);
      r.push = function (r) {
        for (
          var t, n, i = r[0], a = r[1], s = r[3], l = 0, f = [];
          l < i.length;
          l++
        )
          (n = i[l]), d.o(e, n) && e[n] && f.push(e[n][0]), (e[n] = 0);
        for (t in a) d.o(a, t) && (d.m[t] = a[t]);
        for (s && s(d), o && o(r); f.length; ) f.shift()();
      };
      var o = t;
    })(),
    d(79098)
  );
})();
