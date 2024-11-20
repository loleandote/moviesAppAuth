function tokenVerify(req, res, next) {
    var authHeader = req.get('authorization');
    const retrievedToken = authHeader.split(' ')[0];
  
    if (!retrievedToken) {
      res.status(401).send({
        ok: false,
        message: "Token inválido"
      })
    } else {
      jwt.verify(retrievedToken, process.env.TOKEN_SECRET, function (err, retrievedToken) {
        if (err) {
          res.status(401).send({
            ok: false,
            message: "Token inválido"
          });
        } else {
          next();
        }
      });
    }
  }

  module.exports = { tokenVerify };