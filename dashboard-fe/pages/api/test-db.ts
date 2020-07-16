import Driver from "../../src/database/drivers";

export default async (req, res) => {
  await Driver.application_update({
    id: "foo",
    name: "bar",
    metadata: [],
  });
  await Driver.application_addMetrics("foo", {
    type: "application",
    id: "foo",
    name: "bar",
    date: new Date(),
    value: 10,
  });
  res.send(true);
};
