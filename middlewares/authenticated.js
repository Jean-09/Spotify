var jwt = require('jwt-simple');//importar el servicio
var moment = require('moment');
var secret = 'secret_key';

exports.Auth = function (req, res, next) {
    console.log(req.headers.authorization)
    if (!req.headers.authorization) {
        //si no tiene token lo reenvio a login
        return res.status(403).send({ mesagge: 'Falta llave de autorización' })
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ message: "Sesión caducada" })
        }
    } catch (error) {
        console.log(error);
        return res.status(404).send({ message: "Llave no valida" })
    }
    req.user = payload;
    next();
}