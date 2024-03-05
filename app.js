const express = require('express');
const app = express()
const logger = require('morgan');
require('dotenv').config()
const port = process.env.PORT
const conn = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors')

const conexion = conn.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port: process.env.DB_PORT,
});

app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json());

//rutas de user
var user_routes=require('./routes/user');
app.use(user_routes);

var artist_routes= require('./routes/artist')
app.use(artist_routes);

var songs_routes= require('./routes/songs')
app.use(songs_routes);

var albums_routes= require('./routes/albums')
app.use(albums_routes);

app.get('*', (req, res) =>{
    res.send({ message: 'Ruta no valida!'})
})

//Verificar si se esta conectando y de ser asi inicia con express
conexion.connect((error)=>{
    if(error){
        console.log('No se puede conectar a la bace de datos')
    }else{
        console.log('Conexión establecida a la bace de datos');
        app.listen(port, () => {
            console.log(`Servidor API ejecutando en el puerto${port}`)
        })
    }
});