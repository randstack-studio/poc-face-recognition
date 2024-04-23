'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserInformationsSchema extends Schema {
  up () {
    this.create('user_informations', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.text('kyc_number', 255).nullable()
      table.text('fullname', 255).nullable()
      table.text('birth_place', 255).nullable()
      table.text('birth_date', 255).nullable()
      table.text('gender', 255).nullable()
      table.text('address', 255).nullable()
      table.text('rt_rw', 255).nullable()
      table.text('village', 255).nullable()
      table.text('district', 255).nullable()
      table.text('province', 255).nullable()
      table.text('city', 255).nullable()
      table.text('religion', 255).nullable()
      table.text('blood_type', 255).nullable()
      table.text('marital_status', 255).nullable()
      table.text('citizenship', 255).nullable()
      table.text('job', 255).nullable()
      table.text('valid_until', 255).nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_informations')
  }
}

module.exports = UserInformationsSchema
