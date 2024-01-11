'use strict'

const AttendanceHistory = use("App/Models/AttendanceHistory");

const User = use('App/Models/User');
const UserFace = use('App/Models/UserFace');
// const auth = use('Auth');
class MenuController {
  async index({ view, auth }) {
    const userFace = await UserFace.query().where({ user_id: auth.user.id }).first();
    return view.render('menu', {auth: auth.user, update: userFace ? false : true});
  }

  async addFace({ view, auth }) {
    const userFaces = await UserFace.query().where({ user_id: auth.user.id }).fetch();
    const userFacesFormatted = userFaces.rows.map((face) => {
      face.created_at = this.formatDate(face.created_at)
      face.updated_at = this.formatDate(face.updated_at)
      return face;
    });
    return view.render('add-face', { user_id: auth.user.id, userFaces: userFacesFormatted });
  }

  async attendance({ view, auth }) {
    return view.render('attendance2', { user_id: auth.user.id });
  }

  async transaction({ view, auth }) {
    return view.render('transaction', { user_id: auth.user.id });
  }

  async users({ view, auth }) {
    const users = await User.query().where({ role: 'user' }).fetch();
    const formattedUsers = users.rows.map((history) => {
      history.created_at = this.formatDate(history.created_at)
      history.updated_at = this.formatDate(history.updated_at)
      return history;
    });

    return view.render('users', { users: formattedUsers });
  }

  async history({ view, auth }) {
    const histories = await AttendanceHistory.all();
    const formattedHistories = histories.rows.map((history) => {
      history.created_at = this.formatDate(history.created_at)
      history.updated_at = this.formatDate(history.updated_at)
      return history;
    });
    return view.render('history', { user_id: auth.user.id, histories: formattedHistories });
  }

  formatDate(dateString) {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,

    };
    const formattedDate = new Date(dateString);
    formattedDate.setHours(formattedDate.getHours() + 7);

    return formattedDate.toLocaleDateString('id-ID', options);
  }

}

module.exports = MenuController
