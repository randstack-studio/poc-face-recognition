"use strict";
const UserChecker = use("App/Models/UserChecker");
class UserCheckerController {
  async create({ view, auth }) {
    return view.render("user-checker");
  }

  async store({ request, response }) {
    const {
      product,
      nik,
      nik_status,
      name,
      name_status,
      phonenumber,
      phonenumber_status,
      insured_nik,
      insured_nik_status,
      insured_name,
      insured_name_status,
      insured_phonenumber,
      insured_phonenumber_status,
      kyc_image,
      insured_kyc_image,
      selfie_image,
      selfie_image_status,
      insured_selfie_image,
      insured_selfie_image_status,
      report_json,
      insured_report_json
    } = request.all();

    console.log(request.all());
    const userChecker = await UserChecker.create(request.all());
    return {
      success: 1,
      message: "success save record",
      data: userChecker
    }
  }
}

module.exports = UserCheckerController;
