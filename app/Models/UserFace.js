'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserFace extends Model {
  static get table() {
    return 'user_faces'
  }
}

module.exports = UserFace
