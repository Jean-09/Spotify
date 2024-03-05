var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt'); // Importar el servicio
var fs = require('fs');//manejo de archivos FileSystem
var path = require('path');//Rutas o Ubicaciones

const conn = require('mysql2');

const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});

module.exports = {
    // Operaciones CRUD para la entidad album
    save(req, res) {
        console.log(req.body);
        var data = req.body;
        var title = data.name;
        var description = data.description;
        var year = data.image;
        var artist_id = data.artist_id;

        conexion.query(
            'INSERT INTO album (title, description, year, artist_id) VALUES (?, ?, ?, ?)',
            [title, description, year, artist_id],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error, inténtalo más tarde' });
                } else {
                    res.status(200).send({ message: 'Datos del álbum guardados' });
                }
            }
        );
    },

    list(req, res) {
        console.log(req.params)
        var id = parseInt(req.params.id);
        var sql = 'SELECT * FROM album WHERE artist_id=' + id;

        conexion.query(
            sql,
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },
    lista(req, res) {
        conexion.query(
            'SELECT * FROM album',
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },
    getAlbumsById(req, res) {
        var userId = req.params.id;
        var currentUser = req.user;
        var sql = '';
        console.log(currentUser);

        if (currentUser.role == 'admin') {
            // El administrador puede ver todos los perfiles
            sql = 'SELECT * FROM album WHERE id=' + userId;
        } else {
            // Si no es administrador, solo puede ver su propio perfil
            if (currentUser.sub != userId) {
                return res.status(403).send({ message: 'Acceso denegado' });
            }
            sql = 'SELECT * FROM artist WHERE id=' + currentUser.sub;
        }

        conexion.query(
            sql,
            function (err, results, fields) {
                if (results && results.length > 0) {
                    console.log(results)
                    res.status(200).send({ user: results[0] });
                } else {
                    res.status(404).send({ message: 'Usuario no encontrado' });
                }
            }
        );
    },
    delete(req, res) {
        var id = req.params.id;
        var currentUser = req.user;
        if (currentUser.role == 'admin') {
            // Verificar si hay canciones ligadas al álbum
            let checkSongsSql = 'SELECT id FROM song WHERE album_id=?';
            conexion.query(
                checkSongsSql, [id],
                function (err, results, fields) {
                    if (!err) {
                        // Si hay canciones, eliminarlas primero
                        if (results.length > 0) {
                            results.forEach((song) => {
                                let songId = song.id;
                                let deleteSongSql = 'DELETE FROM song WHERE id=?';
                                conexion.query(
                                    deleteSongSql, [songId],
                                    function (err, results, fields) {
                                        if (!err) {
                                            console.log(`Canción ${songId} eliminada`);
                                        } else {
                                            console.log(err);
                                        }
                                    }
                                );
                            });
                        }
                        // Eliminar el álbum
                        let deleteAlbumSql = 'DELETE FROM album WHERE id=?';
                        conexion.query(
                            deleteAlbumSql, [id],
                            function (err, results, fields) {
                                if (!err) {
                                    if (results.affectedRows != 0) {
                                        res.status(200).send({ message: "Datos del álbum eliminados" });
                                    } else {
                                        res.status(200).send({ message: "No se eliminó nada" });
                                    }
                                } else {
                                    console.log(err);
                                    res.status(500).send({ message: "Inténtelo más tarde" });
                                }
                            }
                        );
                    } else {
                        console.log(err);
                        res.status(500).send({ message: "Inténtelo más tarde" });
                    }
                }
            );
        } else {
            return res.status(403).send({ message: 'Acceso denegado' });
        }
    },
    update(req, res) {
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE album SET ? WHERE id=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos del álbum actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },
    uploadImage(req, res) {
        var id = req.params.id;
        var file = 'Sin imagen..';

        if (req.files) {
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\'); //cambiar en linux por \/
            var file_name = file_split[2];
            var ext = file_name.split('.');
            var file_ext = ext[1].toLowerCase();
            if (['jpg', 'gif', 'png', 'jpeg'].includes(file_ext)) {
                conexion.query('UPDATE album SET image="' + file_name + '" WHERE id = ' + id,
                    function (err, results, fields) {
                        if (!err) {
                            console.log(err);
                            if (results.affectedRows != 0) {
                                res.status(200).send({ message: 'Imagen actualizada' });
                            } else {
                                res.status(200).send({ message: 'Error al actualizar' });
                            }
                        } else {
                            console.log(err);
                            res.status(200).send({ message: 'Inténtelo más tarde' });
                        }
                    });
            } else {
                res.status(400).send({ message: 'Formato de imagen no válido' });
            }
        } else {
            res.status(400).send({ message: 'No se proporcionó ningún archivo' });
        }
    },
    getImage(req, res) {
        var image = req.params.image;
        var path_file = './uploads/albums/' + image;
        console.log(path_file)
        if (fs.existsSync(path_file)) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(404).send({ message: 'No existe el archivo' })
        }
    }

};
