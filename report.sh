(cd dashboard-example && yarn build)
cp dashboard-example/dsl/dist/dashboard.json dashboard-fe/data/dsl.json
cp dashboard-example/home/dist/dashboard.json dashboard-fe/data/home.json
cp dashboard-example/search/dist/dashboard.json dashboard-fe/data/search.json
cp dashboard-example/nav/dist/dashboard.json dashboard-fe/data/nav.json