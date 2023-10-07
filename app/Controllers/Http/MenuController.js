'use strict'

const AttendanceHistory = use("App/Models/AttendanceHistory");

const User = use('App/Models/User');
// const auth = use('Auth');
class MenuController {
  async index({ view }) {
    return view.render('menu');
  }

  async addFace({ view, auth }) {
    return view.render('add-face', { user_id: auth.user.id });
  }

  async attendance({ view, auth }) {
    return view.render('attendance2', { user_id: auth.user.id });
  }

  async history({ view, auth }) {
    const histories = await AttendanceHistory.query().where({ user_id: auth.user.id }).fetch();
    const formattedHistories = histories.rows.map((history) => {
      history.created_at = this.formatDate(history.created_at)
      history.updated_at = this.formatDate(history.updated_at)
      return history;
    });

    console.log(formattedHistories)
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
