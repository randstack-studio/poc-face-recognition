'use strict'

const User = use('App/Models/User');
const AttendanceHistory = use('App/Models/AttendanceHistory');
// const auth = use('Auth');
class AuthController {
  async showLoginForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect('/menu');
    }
    return view.render('login');
  }
  async showCreateForm({ auth, view, response }) {
    // if (auth.user) {
    //   return response.redirect('/menu');
    // }
    return view.render('create');
  }
  async showCreateAdminForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect('/menu');
    }
    return view.render('create-admin');
  }

  async create({ view, request, response }) {
    try {
      const { email, password, username, marked_kyc, origin_kyc } = request.all();
      // const users = await User.all();
      const user = new User();
      user.username = username;
      user.email = email;
      user.password = password;
      user.marked_kyc = marked_kyc;
      user.origin_kyc = origin_kyc;
      await user.save();
      // return response.redirect('/login');
      return view.render('create', { data: { success: 1, message: "User berhasil dibuat" } });
    } catch (error) {
      return view.render('create', { data: { success: 0, message: "User gagal dibuat" } });
    }

  }

  async createAdmin({ request, response }) {

    const { email, password, username } = request.all();
    // const users = await User.all();
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    user.role = "admin";
    await user.save();


    // return response.redirect('/login');
  }

  async login({ request, auth, response }) {
    const { email, password } = request.all();
    try {
      await auth.attempt(email, password);
      const attendanceHistory = new AttendanceHistory();
      attendanceHistory.user_id = auth.user.id;
      attendanceHistory.method = "login";
      attendanceHistory.status = 1;
      attendanceHistory.message = "Success Login";
      await attendanceHistory.save();
      return response.redirect('/menu'); // Redirect after successful login
    } catch (error) {
      return response.redirect('/login');
    }
  }
  async showBiometricLoginForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect('/menu');
    }
    return view.render('biometrik-login');
  }

  async biometricLogin({ request, auth, response }) {
    const { email } = request.all();
    try {
      const user = await User.findBy('email', email)
      await auth.login(user);
      return response.redirect('/menu'); // Redirect after successful login
    } catch (error) {
      console.log(error);
      // Handle authentication failure
      return response.redirect('/login');
    }
  }

  async logout({ auth, response }) {
    console.log("logout");
    await auth.logout();
    return response.redirect('/login');
  }
}

module.exports = AuthController
