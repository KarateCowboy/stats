/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function (sequelize, Sequelize) {
  const ReferralCode = sequelize.define('ReferralCode', {
    code_text: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: 'code_text must be six(6) characters long'
        },
        is: {
          args: [/[A-Z0-9]{6,6}/],
          msg: 'code_text may only consist of numbers and upper-case roman letters'
        }
      }
    },
    campaign_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    }

  }, {
    underscored: true,
    schema: 'dtl',
    tableName: 'referral_codes',
    timestamps: true,
    freezeTableName: true
  })
  ReferralCode.associate = () => {
    ReferralCode.belongsTo(db.Campaign)

  }
  return ReferralCode

}
