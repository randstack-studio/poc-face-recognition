'use strict'

const User = use('App/Models/User');
// const auth = use('Auth');
class AuthController {
  async showLoginForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect('/menu');
    }
    return view.render('login');
  }
  async showCreateForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect('/menu');
    }
    return view.render('create');
  }

  async create({ request, response }) {
    const { email, password, username, marked_kyc, origin_kyc } = request.all();
    // const users = await User.all();
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    user.password = password;
    user.password = password;
    user.marked_kyc = marked_kyc;
    user.origin_kyc = origin_kyc;
    await user.save();
    return response.redirect('/login');
  }

  async login({ request, auth, response }) {
    const { email, password } = request.all();
    try {
      console.log(email, password);
      await auth.attempt(email, password);
      return response.redirect('/menu'); // Redirect after successful login
    } catch (error) {
      console.log(error);
      // Handle authentication failure
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
}

module.exports = AuthController
