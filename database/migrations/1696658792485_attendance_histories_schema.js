'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AttendanceHistoriesSchema extends Schema {
  up () {
    this.create('attendance_histories', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.string('captured', 255).nullable()
      table.string('captured_marked', 255).nullable()
      table.string('source_marked', 255).nullable()
      table.string('threshold', 255).nullable()
      table.string('message' , 255).nullable()
      table.boolean('status', 255).nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('attendance_histories')
  }
}

module.exports = AttendanceHistoriesSchema
