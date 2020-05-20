# The `dashboard-fe` server needs to be up and running to do this
(cd dashboard-example && yarn build)
curl "http://localhost:3000/api/update" -X POST -d @dashboard-example/utils/dist/dashboard.json -H "Content-type: application/json"
curl "http://localhost:3000/api/update" -X POST -d @dashboard-example/dsl/dist/dashboard.json -H "Content-type: application/json"
curl "http://localhost:3000/api/update" -X POST -d @dashboard-example/home/dist/dashboard.json -H "Content-type: application/json"
curl "http://localhost:3000/api/update" -X POST -d @dashboard-example/search/dist/dashboard.json -H "Content-type: application/json"
curl "http://localhost:3000/api/update" -X POST -d @dashboard-example/nav/dist/dashboard.json -H "Content-type: application/json"
