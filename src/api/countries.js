exports.setup = (server, client, mongo) => {
  server.route({
    method: 'GET',
    path: '/api/1/countries',
    handler: async function (request, reply) {
      let regions = (await client.query("SELECT id, label, ord FROM dtl.regions ORDER BY id")).rows
      for (let region of regions) {
        region.subitems = (await client.query("SELECT id, label FROM dtl.countries WHERE region_id = $1", [region.id])).rows
      }
      reply(regions)
    }
  })
}
