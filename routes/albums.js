var express = require('express')
var api = express.Router();
var albumController = require('../controllers/album');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: 'uploads/albums' });
var md_auth = require('../middlewares/authenticated');

api.get('/albums/:id',[md_auth.Auth],albumController.list);
api.get('/artistlist',[md_auth.Auth],albumController.lista);
api.get('/albums/albums/:id',[md_auth.Auth],albumController.getAlbumsById);
api.post('/albums',albumController.save);
api.delete('/albums/:id',[md_auth.Auth],albumController.delete);
api.put('/albums/:id',[md_auth.Auth],albumController.update);
api.post('/albums/:id', [md_upload], albumController.uploadImage);
api.get('/albums/image/:image', albumController.getImage);


module.exports = api;