var express = require('express');
var api = express.Router();
var userController = require('../controllers/user');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: 'uploads/users' });
var md_auth = require('../middlewares/authenticated');

api.get('/user', [md_auth.Auth], userController.list);
api.get('/user/user', [md_auth.Auth], userController.listId);
api.get('/user/:id', [md_auth.Auth], userController.getUserById);
api.post('/user', userController.save);
api.delete('/user/:id', [md_auth.Auth], userController.delete);
api.put('/user/:id', [md_auth.Auth], userController.update);
api.post('/login', userController.login);
api.post('/user/image/:id', [md_upload], userController.uploadImage);
api.get('/user/image/:image', [md_upload], userController.getImage);
api.delete('/user/image/:id', [md_upload], userController.delImage);

module.exports = api;
