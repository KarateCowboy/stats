/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function (sequelize, Sequelize) {
  const Campaign = sequelize.define('Campaign', {
    name: {
      type: Sequelize.STRING,
      validate: {
        min: {
          args: 4,
          msg: 'name must be at least four(4) characters long'
        }
      }
    }
  }, {
    underscored: true,
    schema: 'dtl',
    tableName: 'campaigns',
    timestamps: true,
    freezeTableName: true
  })
  Campaign.associate = function(){
    Campaign.hasMany(db.ReferralCode)
  }
  return Campaign

}
