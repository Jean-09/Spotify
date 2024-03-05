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
    // Operaciones CRUD para la entidad artist
    save(req, res) {
        console.log(req.body);
        var data = req.body;
        var name = data.name;
        var description = data.description;
        var userId = data.userId;
        var currentUser = req.user;
    
        if (currentUser.role == 'admin', 'creator') {
            conexion.query(
                'INSERT INTO artist (name, description) VALUES (?, ?)',
                [name, description],
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error, inténtalo más tarde' });
                    } else {
                        res.status(200).send({ message: 'Datos del artista guardados' });
                    }
                }
            );
        } else {
            res.status(403).send({ message: 'Acceso denegado, solo los administradores pueden crear un artista nuevo' });
        }
    },    

    list(req, res) {
        conexion.query(
            'SELECT * FROM artist',
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },
    getArtistById(req, res) {
        var userId = req.params.id;
        var currentUser = req.user;
        var sql = '';
        console.log(currentUser);

        if (currentUser.role == 'admin') {
            console.log(req.params);
            // El administrador puede ver todos los perfiles
            sql = 'SELECT * FROM artist WHERE id=' + userId;
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
        var sql = '';
        console.log(currentUser);
        if (currentUser.role == 'admin') {
            // Verificar si hay álbumes ligados al artista
            sql = 'SELECT id FROM album WHERE artist_id=?';
            conexion.query(
                sql, [id],
                function(err, results, fields) {
                    if (!err) {
                        // Si hay álbumes, eliminarlos primero
                        if (results.length > 0) {
                            results.forEach((album) => {
                                let albumId = album.id;
                                // Eliminar canciones ligadas al álbum
                                let deleteSongsSql = 'DELETE FROM song WHERE album_id=?';
                                conexion.query(
                                    deleteSongsSql, [albumId],
                                    function(err, results, fields) {
                                        if (!err) {
                                            console.log(`Canciones del álbum ${albumId} eliminadas`);
                                        } else {
                                            console.log(err);
                                        }
                                    }
                                );
                            });
                            // Eliminar álbumes ligados al artista
                            let deleteAlbumsSql = 'DELETE FROM album WHERE artist_id=?';
                            conexion.query(
                                deleteAlbumsSql, [id],
                                function(err, results, fields) {
                                    if (!err) {
                                        console.log(`Álbumes del artista ${id} eliminados`);
                                    } else {
                                        console.log(err);
                                    }
                                }
                            );
                        }
                        // Finalmente, eliminar el artista
                        let deleteArtistSql = 'DELETE FROM artist WHERE id=?';
                        conexion.query(
                            deleteArtistSql, [id],
                            function(err, results, fields) {
                                if (!err) {
                                    if (results.affectedRows != 0) {
                                        res.status(200).send({ message: "Datos del usuario eliminados" });
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
        console.log(req.params)
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE artist SET ? WHERE id=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos del artista actualizados" });
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
                conexion.query('UPDATE artist SET image="'+file_name+'" WHERE id = '+id,
                function(err, results, fields){
                    if (!err) {
                        console.log(err);
                        if (results.affectedRows != 0) {
                            res.status(200).send({message: 'Imagen actualizada'});
                        } else {
                            res.status(200).send({message: 'Error al actualizar'});
                        }
                    } else {
                        console.log(err);
                        res.status(200).send({message: 'Inténtelo más tarde'});
                    }
                });
            } else {
                res.status(400).send({message: 'Formato de imagen no válido'});
            }
        } else {
            res.status(400).send({message: 'No se proporcionó ningún archivo'});
        }
    },
    getImage(req, res){
        var image = req.params.image;
        var path_file = './uploads/artist/'+image;
        console.log(path_file)
        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message: 'No existe el archivo'})
        }
    },
    delImage(req, res) {
        id = req.params.id;
        var sql = "SELECT image FROM aartist WHERE id = " + id;

        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length != 0) {
                    if (results[0].image != null) {
                        console.log(results);
                        // Eliminar la imagen física
                        var path_file = './uploads/artist/' + results[0].image;
                        try {
                            // Una vez que la borraste, actualizar y poner un null
                            fs.unlinkSync(path_file);
                            const updateSql = "UPDATE artist SET image = NULL WHERE id = " + id;
                            conexion.query(updateSql, function (updateErr, updateResults) {
                                if (!updateErr) {
                                    console.log("Base de datos actualizada con éxito");
                                    res.status(200).send({ message: "Imagen eliminada" });
                                } else {
                                    console.log(updateErr);
                                    res.status(500).send({ message: "Error al actualizar la base de datos" });
                                }
                            });

                        } catch (error) {
                            console.log(error);
                            res.status(200).send({ message: "No se pudo eliminar, intenta más tarde" });
                        }
                    } else {
                        res.status(404).send({ message: "Imagen no encontrada" });
                    }
                } else {
                    res.status(404).send({ message: "Imagen no encontrada" });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: "Intenta más tarde" });
            }
        });
    },
};
