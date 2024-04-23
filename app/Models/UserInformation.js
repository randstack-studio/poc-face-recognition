'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserInformation extends Model {
  static get table() {
    return 'user_informations'
  }
}

module.exports = UserInformation
