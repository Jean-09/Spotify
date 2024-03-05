var express = require('express')
var api = express.Router();
var artistController = require('../controllers/artist');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: 'uploads/artist' });
var md_auth = require('../middlewares/authenticated');

api.get('/artist',[md_auth.Auth],artistController.list);
api.get('/artist/:id',[md_auth.Auth],artistController.getArtistById);
api.post('/artist',[md_auth.Auth],artistController.save);
api.delete('/artist/:id',[md_auth.Auth],artistController.delete);
api.put('/artist/:id',[md_auth.Auth],artistController.update);
api.post('/artist/:id', [md_upload], artistController.uploadImage);
api.get('/artist/image/:image', artistController.getImage);
api.delete('/artist/image/:id', [md_upload], artistController.delImage);


module.exports = api;