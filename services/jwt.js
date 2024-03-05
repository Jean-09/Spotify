var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secret_key';

exports.createToken= function(user) {
  
    var payload={
        sub:user.Id,
        name:user.Name,
        role:user.Role,
        status:user.Status,
        image:user.Image,
        iat:moment().unix(),
        exp:moment().add(1,'year').unix()
    }
    return jwt.encode(payload,secret);
}
