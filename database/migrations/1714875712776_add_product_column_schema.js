"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddProductColumnSchema extends Schema {
  up() {
    this.table("user_checkers", (table) => {
      table.string("product", 255).after("id").nullable();
      table.string("nik_status", 255).after("nik").nullable();
      table.string("phonenumber_status", 255).after("phonenumber").nullable();
      table.string('insured_nik', 255).after('phonenumber_status').nullable()
      table.string('insured_name', 255).after('insured_nik').nullable()
      table.string('insured_phonenumber', 255).after('insured_name').nullable()
      table.string('insured_nik_status', 255).after('phonenumber_status').nullable()
      table.string('insured_name_status', 255).after('insured_nik').nullable()
      table.string('insured_phonenumber_status', 255).after('insured_name').nullable()
      table.string("name_status", 255).after("name").nullable();
      table.string("kyc_image", 255).after("tag").nullable();
      table.string("insured_kyc_image", 255).after("kyc_image").nullable();
      table.string("selfie_image", 255).after("insured_kyc_image").nullable();
      table.string("insured_selfie_image", 255).after("selfie_image").nullable();
      table.string("selfie_image_status", 255).after("insured_selfie_image").nullable();
      table.string("insured_selfie_image_status", 255).after("selfie_image_status").nullable();
      table.text("report_json", 'longtext').after("insured_selfie_image_status").nullable();
      table.text("insured_report_json", 'longtext').after("report_json").nullable();
    });
  }

  down() {
    this.table("user_checker", (table) => {
      // reverse alternations
    });
  }
}

module.exports = AddProductColumnSchema;
