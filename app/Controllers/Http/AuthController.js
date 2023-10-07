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
    const { email, password, username } = request.all();
    // const users = await User.all();
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
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
}

module.exports = AuthController
