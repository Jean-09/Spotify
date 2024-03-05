var express = require('express');
var api = express.Router();
var songsController = require('../controllers/song');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: 'uploads/song' });
var md_auth = require('../middlewares/authenticated');

api.get('/songs/:id',[md_auth.Auth], songsController.list);
api.get('/songs/songs/:id',[md_auth.Auth], songsController.getSongById);
api.post('/songs', songsController.save);
api.delete('/songs/:id',[md_auth.Auth], songsController.delete);
api.put('/songs/:id',[md_auth.Auth], songsController.update);
api.post('/songs/:id', [md_upload], songsController.uploadSong);
api.get('/songs/file/:file', songsController.getSong);
api.delete('/songs/file/:id',[md_auth.Auth], [md_upload], songsController.delSong);

module.exports = api;


