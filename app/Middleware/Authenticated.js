'use strict';

class Authenticated {
  async handle({ auth, response }, next) {
    // Check if a user is authenticated
    if (!auth.user) {
      return response.redirect('/login'); // Redirect to the login page
    }
    await next();
  }
}

module.exports = Authenticated;
