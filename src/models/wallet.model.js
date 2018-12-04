const Sequelize = require('sequelize')
const {BigNumber} = require('bignumber.js')

module.exports.define = function (sequelize) {
  const Wallet = sequelize.define('Wallet', {
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      wallets: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      balance: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      funded: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    },
    {
      underscored: true,
      schema: 'dw',
      tableName: 'fc_wallets',
      timestamps: true,
      freezeTableName: true
    })

  Wallet.probiToBalance = function (num) {
    return (new BigNumber(num)).dividedBy(1e+18)
  }
  return Wallet

}
