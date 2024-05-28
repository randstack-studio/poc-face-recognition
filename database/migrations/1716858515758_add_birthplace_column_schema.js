'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddBirthplaceColumnSchema extends Schema {
  up () {
    this.table('user_checkers', (table) => {
      table.string("birthplace", 255).after("name").nullable();
      table.string("birthplace_status", 255).after("birthplace").nullable();
      table.string("insured_birthplace", 255).after("insured_name").nullable();
      table.string("insured_birthplace_status", 255).after("insured_birthplace").nullable();
    })
  }

  down () {
    this.table('user_checkers', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddBirthplaceColumnSchema
