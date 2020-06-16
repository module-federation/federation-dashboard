var dsl;
dsl = (() => {
  "use strict";
  var e,
    r,
    t,
    n,
    o,
    i,
    a,
    s = {
      79098: (e, r, t) => {
        var n = {
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
          o = (e) =>
            t.o(n, e)
              ? n[e]()
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
        t.d(r, { get: () => o, init: () => i });
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
      (function () {
        try {
          return (
            window.versions[window.versions.currentHost].override.find(
              function (e) {
                return "dsl" === e.name;
              }
            ).version + "/"
          );
        } catch (e) {
          return "";
        }
      })()),
    (() => {
      d.S = {};
      var e = {};
      d.I = (r) => {
        if (e[r]) return e[r];
        (e[r] = 1), d.o(d.S, r) || (d.S[r] = {});
        var t = d.S[r],
          n = (e) =>
            "undefined" != typeof console && console.warn && console.warn(e),
          o = (e, r, o, i) => {
            (r = r || []), (i = e);
            var a = () =>
                n(
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
                    return n(
                      "Ignoring providing of already used shared module: " + e
                    );
                }
                t[i] = { get: o, version: r };
              };
            s(),
              r.forEach((e) => {
                (i += "`" + e), s();
              });
          },
          i = [];
        switch (r) {
          case "default":
            o("lodash", [4, 17, 15], () => d.e(635).then(() => () => d(76635))),
              o("@emotion/core", [10, 0, 28], () =>
                Promise.all([d.e(961), d.e(456)]).then(() => () => d(4961))
              ),
              o("antd", [4, 3, 3], () =>
                Promise.all([
                  d.e(584),
                  d.e(414),
                  d.e(456),
                  d.e(136),
                  d.e(506),
                ]).then(() => () => d(51971))
              ),
              o("react", [16, 13, 1], () => d.e(784).then(() => () => d(2784))),
              o("@ant-design/icons", [4, 2, 1], () =>
                Promise.all([d.e(584), d.e(659), d.e(456)]).then(() => () =>
                  d(31659)
                )
              ),
              o("react-dom", [16, 13, 1], () =>
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
    (r = (r, t, n, o) => {
      var i,
        a = t,
        s = (n = n || []).map((e) => (a += "`" + e));
      for (s.unshift(t); (a = s.shift()); )
        if (d.o(r, a) && !e((i = r[a].version || []), n)) return r[a];
      var l =
        "Unsatisfied version of shared module " +
        t +
        "@" +
        (i && i.join(".")) +
        " (required " +
        t +
        "@" +
        n.join(".") +
        ")";
      if (o) throw new Error(l);
      "undefined" != typeof console && console.warn && console.warn(l);
    }),
    (t = (e) => ((e.loaded = 1), e.get())),
    (n = (e, n, o, i) => {
      d.I(e);
      var a = d.S[e],
        s = a && r(a, n, o);
      return s ? t(s) : i();
    }),
    (o = {}),
    (i = {
      10456: () =>
        n("default", "react", ["16", 13, 0], () =>
          d.e(784).then(() => () => d(2784))
        ),
      28722: () =>
        n("default", "antd", ["4", 2, 5], () =>
          Promise.all([d.e(584), d.e(414), d.e(136), d.e(847)]).then(() => () =>
            d(51971)
          )
        ),
      29136: () =>
        n("default", "react-dom", ["16", 13, 0], () =>
          d.e(316).then(() => () => d(28316))
        ),
      18689: () =>
        n("default", "@ant-design/icons", ["4", 1, 0], () =>
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
          if (d.o(o, e)) return r.push(o[e]);
          var t = (r) => {
              (o[e] = 0),
                (s[e] = (t) => {
                  delete l[e], (t.exports = r());
                });
            },
            n = (r) => {
              delete o[e],
                (s[e] = (t) => {
                  throw (delete l[e], r);
                });
            };
          try {
            var a = i[e]();
            a.then ? r.push((o[e] = a.then(t).catch(n))) : t(a);
          } catch (e) {
            n(e);
          }
        });
    }),
    (() => {
      var e = { 365: 0 };
      d.f.j = (r, t) => {
        var n = d.o(e, r) ? e[r] : void 0;
        if (0 !== n)
          if (n) t.push(n[2]);
          else if (/^(136|456|722)$/.test(r)) e[r] = 0;
          else {
            var o = new Promise((t, o) => {
              n = e[r] = [t, o];
            });
            t.push((n[2] = o));
            var i,
              a = d.p + d.u(r),
              s = document.createElement("script");
            (s.charset = "utf-8"),
              (s.timeout = 120),
              d.nc && s.setAttribute("nonce", d.nc),
              (s.src = a);
            var l = new Error();
            i = (t) => {
              (i = () => {}), (s.onerror = s.onload = null), clearTimeout(u);
              var o = (() => {
                if (d.o(e, r) && (0 !== (n = e[r]) && (e[r] = void 0), n))
                  return n[1];
              })();
              if (o) {
                var a = t && ("load" === t.type ? "missing" : t.type),
                  f = t && t.target && t.target.src;
                (l.message =
                  "Loading chunk " + r + " failed.\n(" + a + ": " + f + ")"),
                  (l.name = "ChunkLoadError"),
                  (l.type = a),
                  (l.request = f),
                  o(l);
              }
            };
            var u = setTimeout(() => {
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
          var t, o, i = r[0], a = r[1], s = r[3], l = 0, u = [];
          l < i.length;
          l++
        )
          (o = i[l]), d.o(e, o) && e[o] && u.push(e[o][0]), (e[o] = 0);
        for (t in a) d.o(a, t) && (d.m[t] = a[t]);
        for (s && s(d), n && n(r); u.length; ) u.shift()();
      };
      var n = t;
    })(),
    d(79098)
  );
})();
