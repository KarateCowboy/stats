/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this file,
 *  You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function (sequelize, Sequelize) {
  const Download = sequelize.define('Download',{
    sha: {
      type: Sequelize.STRING,
      validate: {
        len: [30,66]
      }
    },
    type: {
      type: Sequelize.STRING,
      notNull: true,
      defaultValue: 'brave-download'
    },
    timestamp: {
      type: Sequelize.DATE,
      notNull: true
    },
    ipAddress: {
      type: Sequelize.STRING,
      notNull: false
    },
    code: {
      type: Sequelize.STRING,
      notNull: false
    },
    requestPath: {
      type: Sequelize.STRING,
      notNull: false
    },
    requestResponseCode: {
      type: Sequelize.INTEGER,
      notNull: false
    },
    domain: {
      type: Sequelize.STRING,
      notNull: false
    },
    platform: {
      type: Sequelize.STRING,
      notNull: false
    },
    key: {
      type: Sequelize.STRING,
      notNull: true,
      validate: {
        validator: function(){
          return /[\d]{4,4}(-\d\d){5,5}-[A-Z0-9]{10,}/.test(this.key)
        }
      }
    }
  }, {
    underscored: true,
    schema: 'dw',
    tableName: 'downloads',
    timestamps: true,
    freezeTableName: true
  })
  return Download

}
