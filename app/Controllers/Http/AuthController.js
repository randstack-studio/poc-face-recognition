"use strict";

const axios = require("axios");
const User = use("App/Models/User");
const UserInformation = use("App/Models/UserInformation");
const AttendanceHistory = use("App/Models/AttendanceHistory");
// const auth = use('Auth');
class AuthController {
  async showLoginForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect("/menu");
    }
    return view.render("login");
  }
  async showCreateForm({ auth, view, response }) {
    // if (auth.user) {
    //   return response.redirect('/menu');
    // }
    return view.render("create");
  }
  async showCreateAdminForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect("/menu");
    }
    return view.render("create-admin");
  }

  async create({ view, request, response }) {
    try {
      const {
        email,
        password,
        username,
        marked_kyc,
        origin_kyc,
        kyc_number,
        fullname,
        birth_place,
        birth_date,
        gender,
        address,
        rt_rw,
        village,
        district,
        province,
        city,
        religion,
        blood_type,
        marital_status,
        citizenship,
        job,
        valid_until,
        phone_number,
      } = request.all();
      // const users = await User.all();
      const user = new User();
      user.username = username;
      user.email = email;
      user.password = password;
      user.marked_kyc = marked_kyc;
      user.origin_kyc = origin_kyc;
      user.phone_number = phone_number;

      /** CHECK PHONUMBER VIA BOIVA */
      try {
        const token = await axios.get("https://sandbox.boiva.id/b2b/v0/token", {
          headers: {
            "Content-Type": "application/json",
            "X-Client-Id": "coihi028dihs5rhsai3g",
            "X-Client-Key": "coihi028dihs5rhsai40",
          },
        });

        if (token.status == 200) {
          const phoneResponse = await axios.post(
            "https://sandbox.boiva.id/b2b/v0/telcos-verification",
            {
              phone_number: "62895369163319",
              ktp: "",
            },
            {
              headers: {
                Authorization: token.data.token,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(phoneResponse);

          if (phoneResponse.status == 200) {
            if (phoneResponse.data.data[0].score != 1) {
              return view.render("create", {
                data: {
                  success: 0,
                  message: "Nomor telpon tidak terdaftar (Boiva)",
                },
              });
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
      /** CHECK PHONUMBER VIA BOIVA */

      await user.save();

      if (kyc_number) {
        const userInformation = new UserInformation();
        userInformation.user_id = user.id;
        userInformation.kyc_number = kyc_number;
        userInformation.fullname = fullname;
        userInformation.birth_place = birth_place;
        userInformation.birth_date = birth_date;
        userInformation.gender = gender;
        userInformation.address = address;
        userInformation.rt_rw = rt_rw;
        userInformation.village = village;
        userInformation.district = district;
        userInformation.province = province;
        userInformation.city = city;
        userInformation.religion = religion;
        userInformation.blood_type = blood_type;
        userInformation.marital_status = marital_status;
        userInformation.citizenship = citizenship;
        userInformation.job = job;
        userInformation.valid_until = valid_until;

        await userInformation.save();
      }

      // return response.redirect('/login');
      return view.render("create", {
        data: { success: 1, message: "User berhasil dibuat" },
      });
    } catch (error) {
      console.log(error);
      return view.render("create", {
        data: { success: 0, message: "User gagal dibuat" },
      });
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
      return response.redirect("/menu"); // Redirect after successful login
    } catch (error) {
      return response.redirect("/login");
    }
  }
  async showBiometricLoginForm({ auth, view, response }) {
    if (auth.user) {
      return response.redirect("/menu");
    }
    return view.render("biometrik-login-3");
  }

  async biometricLogin({ request, auth, response }) {
    const { email } = request.all();
    try {
      const user = await User.findBy("email", email);
      await auth.login(user);
      return response.redirect("/menu"); // Redirect after successful login
    } catch (error) {
      console.log(error);
      // Handle authentication failure
      return response.redirect("/login");
    }
  }

  async logout({ auth, response }) {
    console.log("logout");
    await auth.logout();
    return response.redirect("/login");
  }
}

module.exports = AuthController;
