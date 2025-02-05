'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/attendance').render('attendance').middleware(['auth']);
Route.on('/emotional-face').render('emotional-face');
Route.on('/mediapipe-face').render('mediapipe-face-landmark');
Route.get('/realtime-facing','FaceRecognitionController.realtimeFacing').middleware(['auth']);



Route.get('/', ({response}) => {
  return response.redirect('/login');
})
Route.get('/face-detection', 'FaceRecognitionController.faceDetection');
Route.get('/face-matching', 'FaceRecognitionController.faceMatching');
Route.get('/send-message', 'FaceRecognitionController.sendMessage');

// AUTH
Route.get('/menu/create-user', 'AuthController.showCreateForm').middleware(['auth']);
Route.post('/create-user', 'AuthController.create').middleware(['auth']);

Route.get('/auth/logout', 'AuthController.logout').middleware(['auth']);

Route.get('/login', 'AuthController.showLoginForm');
Route.get('/create-admin', 'AuthController.showCreateAdminForm');
Route.post('/create-admin', 'AuthController.createAdmin');
Route.post('/login', 'AuthController.login');
Route.get('/biometric-login', 'AuthController.showBiometricLoginForm');
Route.post('/biometric-login', 'AuthController.biometricLogin');
// MENU
Route.get('/menu', 'MenuController.index').middleware(['auth']);

// ADD FACE
Route.get('/menu/add-face', 'MenuController.addFace').middleware(['auth']);
Route.get('/menu/attendance', 'MenuController.attendance').middleware(['auth']);
Route.get('/menu/attendance-report', 'MenuController.history').middleware(['auth']);

// USERS
Route.get('/menu/users', 'MenuController.users').middleware(['auth']);
Route.get('/menu/transaction', 'MenuController.transaction').middleware(['auth']);

// USER VERIFICATION
Route.get('/menu/user-verification', 'MenuController.userVerification').middleware(['auth']);
Route.get('/menu/user-verification/download', 'MenuController.userVerificationDownload').middleware(['auth']);
Route.get('/menu/user-verification/create', 'UserCheckerController.create').middleware(['auth']);
Route.post('/user-verification/store', 'UserCheckerController.store').middleware(['auth']);

