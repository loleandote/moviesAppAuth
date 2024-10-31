var express = require("express");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var router = express.Router();
// Token generation imports
const dotenv = require('dotenv');
// get config vars
dotenv.config();
var debug = require("debug")("moviesAppAuth:server");

//Models
var Movie = require("../models/Movie.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;
function tokenVerify (req, res, next) {
  var authHeader=req.get('authorization');
  const retrievedToken = authHeader.split(' ')[0];
  
  if (!retrievedToken) {
      res.status(401).send({
          ok: false,
          message: "Token inválido"
      })
  }else{       
      jwt.verify(retrievedToken, process.env.TOKEN_SECRET,  function (err, retrievedToken) {
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

router.get("/secure", tokenVerify, 
  function (req, res, next) {
      debug("Acceso seguro con token a las películas");
      Movie.find().sort("-creationdate").exec(function (err, movies) {
          if (err) res.status(500).send(err);
          else res.status(200).json(movies);
      })
  });
/* GET movies listing */
router.get("/", function (req, res) {
  Movie.find().then(function (movies) {
    if (movies) {
      debug("Movies found:", movies);
    } else {
      debug("No movies found.");
    }
    res.status(200).json(movies)
  }).catch(function (err) {
    res.status(500).send(err)
  });
});

/* GET single movie by Id */
router.get("/:id", function (req, res) {
  Movie.findById(req.params.id).then(function (movieinfo) {
    if (movieinfo) {
      debug("Movie found:", movieinfo);
      res.status(200).json(movieinfo);
    } else {
      res.status(404).send("Movie not found");
    }
  }).catch(function (err) {
    res.status(500).send(err);
  });
});

  // /* POST a new movie*/
  // router.post("/", function (req, res) {
  //   Movie.create(req.body, function (err, movieinfo) {
  //     if (err) res.status(500).send(err);
  //     else res.sendStatus(200);
  //   });
  // });

    /* POST a new movie (ahora conviene hacerlo todo con promesas) */
router.post("/", crearPelicula);
  // POST de una nueva pelicula
router.post("/secure", tokenVerify, crearPelicula);
function crearPelicula(req,res){
  Movie.create(req.body).then(function (movie) {
    res.status(201).json(movie);
  }).catch(function (err) {
    res.status(500).send(err);
  });
}
function actualizaPelicula(req,res){
  Movie.findByIdAndUpdate(req.params.id, req.body, function (err, movieinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
});
}
router.put("/:id", actualizaPelicula);
router.put("/secure/:id", tokenVerify, function (req, res, next) {
  debug("Modificación segura de una pelicula con token");
 actualizaPelicula(req,res);
});
router.delete("/:id", function (req, res, next) {
  Movie.findByIdAndDelete(req.params.id, function (err, movieinfo) {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
  });
});
router.delete("/secure/:id", tokenVerify, function (req, res, next) {
  debug("Borrado seguro de una pelicula con token");
  Movie.findByIdAndDelete(req.params.id, function (err, movieinfo) {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
  });
});

  module.exports = router;