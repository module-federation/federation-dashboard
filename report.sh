(cd dashboard-example && yarn build)
cp dashboard-example/utils/dist/dashboard.json dashboard-fe/data/utils.json
cp dashboard-example/dsl/dist/dashboard.json dashboard-fe/data/dsl.json
cp dashboard-example/home/dist/dashboard.json dashboard-fe/data/home.json
cp dashboard-example/search/dist/dashboard.json dashboard-fe/data/search.json
cp dashboard-example/nav/dist/dashboard.json dashboard-fe/data/nav.json
node dashboard-fe/scripts/convert-to-graph.js dsl.json home.json search.json nav.json utils.json
