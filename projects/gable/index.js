const { queryAddresses } = require('../helper/chain/radixdlt');
const { getFixBalancesSync } = require('../helper/portedTokens');
const { getUniqueAddresses, } = require('../helper/tokenMapping');
const chain = 'radixdlt'

module.exports = {
  misrepresentedTokens: true,
  radixdlt: {
    tvl: async (_, _b, _cb, { api, }) => {

      const data = await queryAddresses({
        addresses: ["component_rdx1cpmh7lyg0hx6efv5q79lv6rqxdqpuh27y99nzm0jpwu2u44ne243ws"]
      });

      let owners = [];

      data.forEach((c) => {
         owners.push(c.details.state.fields.find((i) => i.field_name === 'liquidity_pool_vault').value);
         owners.push(c.details.state.fields.find((i) => i.field_name === 'lsu_vault').value);
      });

      const fixBalances = getFixBalancesSync(chain)

      owners = getUniqueAddresses(owners)

      if (!owners.length) return api.getBalances()

      let items = await queryAddresses({ addresses: owners })

      items.forEach((item) => {
        const { resource_address, balance } = item.details;
        api.add(resource_address, +balance.amount);
      });
      
      return fixBalances(api.getBalances())

    },
  },
  timetravel: false,
}