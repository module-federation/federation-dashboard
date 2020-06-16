(() => {
  var e,
    r,
    t,
    o,
    n,
    a,
    i,
    s = {},
    l = {};
  function d(e) {
    if (l[e]) return l[e].exports;
    var r = (l[e] = { id: e, loaded: !1, exports: {} });
    return s[e].call(r.exports, r, r.exports, d), (r.loaded = !0), r.exports;
  }
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
    (d.p = "http://localhost:3002/"),
    (() => {
      d.S = {};
      var e = {};
      d.I = (r) => {
        if (e[r]) return e[r];
        (e[r] = 1), d.o(d.S, r) || (d.S[r] = {});
        var t = d.S[r],
          o = (e) =>
            "undefined" != typeof console && console.warn && console.warn(e),
          n = (e, r, n, a) => {
            (r = r || []), (a = e);
            var i = () =>
                o(
                  "Version conflict for shared modules: " +
                    e +
                    " " +
                    (v && v.join(".")) +
                    " <=> " +
                    (r && r.join("."))
                ),
              s = () => {
                if (t[a]) {
                  for (
                    var s = t[a].version || [], l = 0;
                    l < r.length && l < s.length;
                    l++
                  )
                    if (s[l] != r[l]) {
                      if ("string" == typeof s[l] || "string" == typeof r[l])
                        return i();
                      if (s[l] > r[l]) return;
                      if (s[l] < r[l]) {
                        l = -1;
                        break;
                      }
                    }
                  if (l >= 0 && r.length <= s.length) return;
                  if (t[a].loaded)
                    return o(
                      "Ignoring providing of already used shared module: " + e
                    );
                }
                t[a] = { get: n, version: r };
              };
            s(),
              r.forEach((e) => {
                (a += "`" + e), s();
              });
          },
          a = [];
        switch (r) {
          case "default":
            n("lodash", [4, 17, 15], () => d.e(635).then(() => () => d(76635))),
              n("@emotion/core", [10, 0, 28], () =>
                Promise.all([d.e(961), d.e(456)]).then(() => () => d(4961))
              ),
              n("antd", [4, 3, 4], () =>
                Promise.all([
                  d.e(584),
                  d.e(110),
                  d.e(456),
                  d.e(136),
                  d.e(616),
                ]).then(() => () => d(60721))
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
        return a.length && (e[r] = Promise.all(a).then(() => (e[r] = 1)));
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
      var a,
        i = t,
        s = (o = o || []).map((e) => (i += "`" + e));
      for (s.unshift(t); (i = s.shift()); )
        if (d.o(r, i) && !e((a = r[i].version || []), o)) return r[i];
      var l =
        "Unsatisfied version of shared module " +
        t +
        "@" +
        (a && a.join(".")) +
        " (required " +
        t +
        "@" +
        o.join(".") +
        ")";
      if (n) throw new Error(l);
      "undefined" != typeof console && console.warn && console.warn(l);
    }),
    (t = (e) => ((e.loaded = 1), e.get())),
    (o = (e, o, n, a) => {
      d.I(e);
      var i = d.S[e],
        s = i && r(i, o, n);
      return s ? t(s) : a();
    }),
    (n = {}),
    (a = {
      10456: () =>
        o("default", "react", ["16", 13, 0], () =>
          d.e(784).then(() => () => d(2784))
        ),
      28722: () =>
        o("default", "antd", ["4", 2, 5], () =>
          Promise.all([d.e(584), d.e(110), d.e(136), d.e(709)]).then(() => () =>
            d(60721)
          )
        ),
      29136: () =>
        o("default", "react-dom", ["16", 13, 0], () =>
          d.e(316).then(() => () => d(28316))
        ),
    }),
    (i = { 136: [29136], 456: [10456], 722: [28722] }),
    (d.f.consumes = (e, r) => {
      d.o(i, e) &&
        i[e].forEach((e) => {
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
            var i = a[e]();
            i.then ? r.push((n[e] = i.then(t).catch(o))) : t(i);
          } catch (e) {
            o(e);
          }
        });
    }),
    (() => {
      var e = { 179: 0 };
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
            var a,
              i = d.p + d.u(r),
              s = document.createElement("script");
            (s.charset = "utf-8"),
              (s.timeout = 120),
              d.nc && s.setAttribute("nonce", d.nc),
              (s.src = i);
            var l = new Error();
            a = (t) => {
              (a = () => {}), (s.onerror = s.onload = null), clearTimeout(f);
              var n = (() => {
                if (d.o(e, r) && (0 !== (o = e[r]) && (e[r] = void 0), o))
                  return o[1];
              })();
              if (n) {
                var i = t && ("load" === t.type ? "missing" : t.type),
                  u = t && t.target && t.target.src;
                (l.message =
                  "Loading chunk " + r + " failed.\n(" + i + ": " + u + ")"),
                  (l.name = "ChunkLoadError"),
                  (l.type = i),
                  (l.request = u),
                  n(l);
              }
            };
            var f = setTimeout(() => {
              a({ type: "timeout", target: s });
            }, 12e4);
            (s.onerror = s.onload = a), document.head.appendChild(s);
          }
      };
      var r = (window.webpackJsonp_dashboard_dsl =
          window.webpackJsonp_dashboard_dsl || []),
        t = r.push.bind(r);
      r.push = function (r) {
        for (
          var t, n, a = r[0], i = r[1], s = r[3], l = 0, f = [];
          l < a.length;
          l++
        )
          (n = a[l]), d.o(e, n) && e[n] && f.push(e[n][0]), (e[n] = 0);
        for (t in i) d.o(i, t) && (d.m[t] = i[t]);
        for (s && s(d), o && o(r); f.length; ) f.shift()();
      };
      var o = t;
    })(),
    Promise.all([d.e(456), d.e(722), d.e(136), d.e(480)]).then(
      d.bind(d, 37480)
    );
})();
