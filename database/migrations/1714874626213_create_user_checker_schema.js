'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateUserCheckerSchema extends Schema {
  up () {
    this.create('user_checkers', (table) => {
      table.increments()
      table.string('nik', 255).nullable()
      table.string('name', 255).nullable()
      table.string('phonenumber', 255).nullable()
      table.integer('attemps').nullable()
      table.string('tag', 255).nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_checkers')
  }
}

module.exports = CreateUserCheckerSchema
