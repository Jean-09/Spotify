var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');//importar el servicio
var fs = require('fs');//manejo de archivos FileSystem
var path = require('path');//Rutas o Ubicaciones


const conn = require('mysql2');
const { constants } = require('buffer');
const { error } = require('console');

const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});

module.exports = {
    save(req, res) {
        console.log(req.body);
        var data = req.body;
        var name = data.name;
        var username = data.username;
        var password = data.password;
        var email = data.email;

        if (data.password != '' && data.password != null) {
            bcrypt.hash(data.password, null, null, function (err, hash) {
                if (err) {
                    console.log(err)
                    res.status(200).send({ message: "Intenta nuevamente" });
                } else {
                    password = hash;
                    conexion.query(
                        'INSERT INTO user (username, password, email, name) VALUES("' + username + '", "' + password + '", "' + email + '", "' + name + '")',
                        function (err, results, fields) {
                            if (err) {
                                console.log(err)
                                res.status(500).send({ message: 'Error, intente mas tarde' })
                            } else {
                                res.status(200).send({ message: 'datos guardados' })
                            }
                        }
                    )
                }
            })
        } else {
            res.status(200).send({ message: 'introduce una contraseña' });
        }


    },

    list(req, res) {
        var user = req.user
        var sql = ''
        console.log(user)
        if (user.role == 'admin') {
            //mostrar toda la información
            sql = 'SELECT * FROM user'
        } else {
            //mostrar su información
            sql = 'SELECT * FROM user WHERE id=' + user.sub
        }
        console.log(req.user)
        conexion.query(
            sql,
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results })
                } else {
                    res.status(500).send({ message: 'Error: intentalo mas tarde' })
                }
            }
        );
    },
    listId(req, res) {
        var user = req.user
        var sql = ''
        console.log(user)
            sql = 'SELECT * FROM user WHERE id=' + user.sub
        
        console.log(req.user)
        conexion.query(
            sql,
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results })
                } else {
                    res.status(500).send({ message: 'Error: intentalo mas tarde' })
                }
            }
        );
    },
    getUserById(req, res) {
        var userId = req.params.id;
        var currentUser = req.user;
        var sql = '';
        console.log(currentUser);

        if (currentUser.role == 'admin') {
            // El administrador puede ver todos los perfiles
            sql = 'SELECT * FROM user WHERE id=' + userId;
        } else {
            // Si no es administrador, solo puede ver su propio perfil
            if (currentUser.sub != userId) {
                return res.status(403).send({ message: 'Acceso denegado' });
            }
            sql = 'SELECT * FROM user WHERE id=' + currentUser.sub;
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
    login(req, res) {
        var data = req.body;
        console.log(req.body)
        var username = data.username;
        var password = data.password;
        var token = data.token;
        conexion.query('SELECT * FROM user WHERE Username ="' + username + '"LIMIT 1',
            function (err, results, fields) {
                console.log(results);
                if (!err) {
                    if (results.length != 0) {
                        bcrypt.compare(password, results[0].Password, function (err, check) {
                            if (check) {
                                if (token) {
                                    res.status(200).send({ token: jwt.createToken(results[0]) })
                                } else {
                                    res.status(200).send({ message: 'Datos correcto' });
                                }
                            } else {
                                res.status(200).send({ message: 'Datos incorrectos' })
                            }
                        })
                    } else {
                        res.status(500).send({ message: 'intentelo mas tarde' })
                    }
                } else {
                    res.status(404).send({ message: 'Datos incorrectos' })
                }
            });
    },
    
    delete(req, res) {
        console.log(req.params);
         var userId = req.params.id;
         var currentUser = req.user;
         var sql = '';
         console.log(currentUser);

         if (currentUser.role == 'admin') {
             // Eliminar cualquiera de los perfiles
             sql = 'DELETE FROM user WHERE id=' + userId;
         } else {
             // Eliminar mi propio usuario
             if (currentUser.sub != userId) {
                 return res.status(403).send({ message: 'Acceso denegado' });
             }
             sql = 'DELETE FROM user WHERE id=' + currentUser.sub;
         }

         conexion.query(
             sql,
             function (err, results, fields) {
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
     },
    //  delete(req, res) {
    //      var id = req.params.id;
    //      var sqlSelect = "SELECT image FROM artist WHERE id = ?";
    //      var sqlDelete = "DELETE FROM image WHERE id = ?";
    
    //     conexion.query(sqlSelect, [id], function (err, results, fields) {
    //         if (!err) {
    //             if (results.length != 0) {
    //                 if (results[0].file != null) {
    //                     var path_file = './uploads/albums/' + results[0].file;
    //                     try {
    //                         fs.unlinkSync(path_file);
    //                         const updateSql = "UPDATE artist SET image = NULL WHERE id = ?";
    //                         conexion.query(updateSql, [id], function (updateErr, updateResults) {
    //                             if (!updateErr) {
    //                                 console.log("Base de datos actualizada con éxito");
    //                                 conexion.query(sqlDelete, [id], function (deleteErr, deleteResults) {
    //                                     if (!deleteErr) {
    //                                         console.log("Canción eliminada");
    //                                         res.status(200).send({ message: "Canción eliminada" });
    //                                     } else {
    //                                         console.log(deleteErr);
    //                                         res.status(500).send({ message: "Error al eliminar la canción" });
    //                                     }
    //                                 });
    //                             } else {
    //                                 console.log(updateErr);
    //                                 res.status(500).send({ message: "Error al actualizar la base de datos" });
    //                             }
    //                         });
    //                     } catch (error) {
    //                         console.log(error);
    //                         res.status(500).send({ message: "Error al eliminar la imagen física" });
    //                     }
    //                 } else {
    //                     conexion.query(sqlDelete, [id], function (deleteErr, deleteResults) {
    //                         if (!deleteErr) {
    //                             console.log("Canción eliminada");
    //                             res.status(200).send({ message: "Canción eliminada" });
    //                         } else {
    //                             console.log(deleteErr);
    //                             res.status(500).send({ message: "Error al eliminar la canción" });
    //                         }
    //                     });
    //                 }
    //             } else {
    //                 res.status(404).send({ message: "Canción no encontrada" });
    //             }
    //         } else {
    //             console.log(err);
    //             res.status(500).send({ message: "Intenta más tarde" });
    //         }
    //     });
    // },

    update(req, res) {
        id = req.params.id;
        data = req.body;
        console.log(data)
        var sql = 'UPDATE user SET ? WHERE id=?';
        if (data.password) {
            bcrypt.hash(data.password, null, null, function (err, hash) {
                if (!err) {
                    data.password = hash;
                    conexion.query(sql, [data, id],
                        function (err, results, fields) {
                            if (!err) {
                                console.log(results);
                            } else {
                                console.log(err);
                                res.status(500).send({ message: "Inténtelo más tarde" });
                            }
                        });
                } else {
                    console.log(err);
                    res.status(500).send({ message: "Inténtelo más tarde" });
                }
            })
        } else {
            let newData = { ...data };
            delete newData.password;
            conexion.query(sql, [newData, id],
                function (err, results, fields) {
                    if (!err) {
                        console.log(results);
                    } else {
                        console.log(err);
                    }
                });
        }
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
                conexion.query('UPDATE user SET Image="' + file_name + '" WHERE Id = ' + id,
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
        var path_file = './uploads/users/' + image;
        console.log(path_file)
        if (fs.existsSync(path_file)) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(404).send({ message: 'No existe el archivo' })
        }
    },
    delImage(req, res) {
        id = req.params.id;
        var sql = "SELECT image FROM user WHERE id = " + id;

        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length != 0) {
                    if (results[0].image != null) {
                        console.log(results);
                        // Eliminar la imagen física
                        var path_file = './uploads/users/' + results[0].image;
                        try {
                            // Una vez que la borraste, actualizar y poner un null
                            fs.unlinkSync(path_file);
                            const updateSql = "UPDATE user SET image = NULL WHERE id = " + id;
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
}