'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddPhonenumberToUsersSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.text('phone_number', 255).after('email').nullable()
    })
  }

  down () {
    this.table('users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddPhonenumberToUsersSchema
