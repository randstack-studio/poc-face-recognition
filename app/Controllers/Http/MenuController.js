"use strict";

const AttendanceHistory = use("App/Models/AttendanceHistory");

const User = use("App/Models/User");
const UserFace = use("App/Models/UserFace");
const UserChecker = use("App/Models/UserChecker");
// const auth = use('Auth');
class MenuController {
  async index({ view, auth }) {
    const userFace = await UserFace.query()
      .where({ user_id: auth.user.id })
      .first();
    return view.render("menu", {
      auth: auth.user,
      update: userFace ? false : true,
    });
  }

  async addFace({ view, auth }) {
    const userFaces = await UserFace.query()
      .where({ user_id: auth.user.id })
      .fetch();
    const userFacesFormatted = userFaces.rows.map((face) => {
      face.created_at = this.formatDate(face.created_at);
      face.updated_at = this.formatDate(face.updated_at);
      return face;
    });
    return view.render("add-face", {
      user_id: auth.user.id,
      userFaces: userFacesFormatted,
    });
  }

  async attendance({ view, auth }) {
    return view.render("attendance2", { user_id: auth.user.id });
  }

  async transaction({ view, auth }) {
    return view.render("transaction", { user_id: auth.user.id });
  }

  async users({ view, auth }) {
    const users = await User.query().where({ role: "user" }).fetch();
    const formattedUsers = users.rows.map((history) => {
      history.created_at = this.formatDate(history.created_at);
      history.updated_at = this.formatDate(history.updated_at);
      return history;
    });

    return view.render("users", { users: formattedUsers });
  }

  async userVerification({ view, auth, request }) {
    // GET QUERY STRING ?tag=Ya
    const tag = request.input("tag") ? request.input("tag") : null;
    console.log(tag);

    const users = await UserChecker.query().orderBy('created_at', 'desc').fetch();
    const formattedUsers = users.rows.map((history) => {
      history.created_at = this.formatDateWithoutTime(history.created_at);
      history.updated_at = this.formatDateWithoutTime(history.updated_at);
      return history;
    });

    // GROUPING BY NIK AND CREATED_AT
    const groupedUsers = formattedUsers.reduce((acc, obj) => {
      const key = obj.nik + obj.product + obj.created_at;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});

    const output = Object.values(groupedUsers);

    let fixOutput = output.map((group) => {
      // IN TAG CHECKER PLEASE CHECK OF STRING OF INSURED_NAME_STATUS, NAME_STATUS, AND NIK_STATUS IF CONTAINS 'TIDAK' THEN TAG = 'TIDAK'
      return {
        nik: group[0].nik,
        created_at: group[0].created_at,
        phonenumber: group[0].phonenumber,
        name: group[0].name,
        product: group[0].product,
        tag: group.map((user) => {
          if (
            user?.name_status?.includes("tidak") ||
            user?.nik_status?.includes("tidak") ||
            // user.phonenumber_status.includes("Tidak") &&
            user?.insured_name_status?.includes("tidak") ||
            user?.insured_nik_status?.includes("tidak")
            // user.insured_phonenumber_status.includes("Tidak")
          ) {
            return "tidak";
          } else {
            return "ya";
          }
        }),
        attempts: group.length,
        users: group,
      };
    });

    // create overview of total verification, total success, and total failed. but if in tag contains 'Ya' whatever the status is, it will be counted as success
    const totalVerification = fixOutput.length;
    const totalSuccess = fixOutput.filter((user) =>
      user.tag.includes("ya")
    ).length;
    const totalFailed = totalVerification - totalSuccess;

    console.log(tag);
    return view.render("user-verification", {
      users: fixOutput,
      overview: { totalVerification, totalSuccess, totalFailed, percentageSuccess: (totalSuccess / totalVerification * 100).toFixed(), percentageFailed: (totalFailed / totalVerification * 100).toFixed() },
      tag: tag
    });
  }

  async userVerificationDownload({ view, auth, request }) {
    // GET QUERY STRING ?tag=Ya
    const tag = request.input("tag") ? request.input("tag") : null;
    console.log(tag);

    const users = await UserChecker.query().fetch();
    const formattedUsers = users.rows.map((history) => {
      history.created_at = this.formatDateWithoutTime(history.created_at);
      history.updated_at = this.formatDateWithoutTime(history.updated_at);
      return history;
    });

    // GROUPING BY NIK AND CREATED_AT
    const groupedUsers = formattedUsers.reduce((acc, obj) => {
      const key = obj.nik + obj.created_at;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});

    const output = Object.values(groupedUsers);

    let fixOutput = output.map((group) => {
      // IN TAG CHECKER PLEASE CHECK OF STRING OF INSURED_NAME_STATUS, NAME_STATUS, AND NIK_STATUS IF CONTAINS 'TIDAK' THEN TAG = 'TIDAK'
      return {
        nik: group[0].nik,
        created_at: group[0].created_at,
        phonenumber: group[0].phonenumber,
        name: group[0].name,
        ct_response: group[0].ct_response,
        tag: group.map((user) => {
          if (
            user.name_status.includes("tidak") ||
            user.nik_status.includes("tidak") ||
            // user.phonenumber_status.includes("Tidak") &&
            user.insured_name_status.includes("tidak") ||
            user.insured_nik_status.includes("tidak")
            // user.insured_phonenumber_status.includes("Tidak")
          ) {
            return "tidak";
          } else {
            return "ya";
          }
        }),
        attempts: group.length,
        users: group,
      };
    });

    // create overview of total verification, total success, and total failed. but if in tag contains 'Ya' whatever the status is, it will be counted as success
    const totalVerification = fixOutput.length;
    const totalSuccess = fixOutput.filter((user) =>
      user.tag.includes("ya")
    ).length;
    const totalFailed = totalVerification - totalSuccess;

    return view.render("user-verification-download", {
      users: formattedUsers,
    });
  }

  async history({ view, auth }) {
    const histories = await AttendanceHistory.all();
    const formattedHistories = histories.rows.map((history) => {
      history.created_at = this.formatDate(history.created_at);
      history.updated_at = this.formatDate(history.updated_at);
      return history;
    });

    return view.render("history", {
      user_id: auth.user.id,
      histories: formattedHistories,
    });
  }

  formatDate(dateString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedDate = new Date(dateString);
    formattedDate.setHours(formattedDate.getHours() + 7);

    return formattedDate.toLocaleDateString("id-ID", options);
  }

  formatDateWithoutTime(dateString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const formattedDate = new Date(dateString);
    formattedDate.setHours(formattedDate.getHours() + 7);

    return formattedDate.toLocaleDateString("id-ID", options);
  }
}

module.exports = MenuController;
