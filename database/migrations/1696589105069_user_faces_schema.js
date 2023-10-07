'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserFacesSchema extends Schema {
  up() {
    this.create('user_faces', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.string('image', 255).notNullable()
      table.string('image_face_marked', 255).notNullable()
      table.text('image_face_description', 'longtext').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamps()
    })
  }

  down() {
    this.drop('user_faces')
  }
}

module.exports = UserFacesSchema
