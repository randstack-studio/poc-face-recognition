'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AttendanceHistoriesSchema extends Schema {
  up () {
    this.table('attendance_histories', (table) => {
      table.string('method', 255).after('user_id').nullable();
    })
  }

  down () {
    this.table('attendance_histories', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AttendanceHistoriesSchema
