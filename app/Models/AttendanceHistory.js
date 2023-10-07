'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AttendanceHistory extends Model {
  static get table() {
    return 'attendance_histories'
  }


}

module.exports = AttendanceHistory
