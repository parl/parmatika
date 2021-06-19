
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express()
const bodyParser = require('express').json()
const cors = require('cors')
app.use(bodyParser)
app.use(cors())
const database = require('mysql')
const connection = database.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'parmatika'
})
connection.connect(err => {
    console.log('database connected')
})
const secret = "secret"

//CRUD

// find id
app.get('/akun/:id', (req, res) => {
    const id = req.params.id
    connection.query(`SELECT * FROM akun WHERE id = ${id}`, (err, results, field) => {
        if (err){
            throw(err)
        }
        console.log(field)
        res.send(results)
    })
})

//create
app.post('/akun', (req, res) => {
    const {namaDepan, namaBelakang, email, nomorTelepon, username, kataSandi} = req.body
    connection.query(`INSERT INTO akun (namaDepan, namaBelakang, email, nomorTelepon, username, kataSandi) values ('${namaDepan}','${namaBelakang}','${email}',${nomorTelepon},'${username}','${kataSandi}')`, 
    (err, results, field) => {
        if (err){
            throw(err)
        }
        res.send(results)
    })
    //
})

//middleware validasi token
const validateToken = (req,res,next) => {
    const authHeader = req.header('Authorization')
    console.log(authHeader)
    if(!authHeader) return res.status(401).send('Unauthorized')
    const token = authHeader.split(' ')[1]
    jwt.verify(token, secret, (err) => {
        if(err){
            res.status(401)
        }
        res.locals.token = jwt.decode(token)
        next()
    })
    

}


//login
app.post('/login',  (req,res) => {
    const{username, kataSandi} = req.body
    connection.query(`SELECT * FROM akun WHERE username = '${username}'`, (err,results,field) =>{
        if (err){
            console.log(err)
            return res.status(400)
        }
        if (results[0].kataSandi != kataSandi){
            return res.send(401)   
        }
        const token = jwt.sign({username}, secret)
        return res.json({token})
        
    })
})

//update 
app.put('/akun', [validateToken], async (req, res) => {
    const decoded = jwt.verify(token, 'secret')
    const {namaDepan, namaBelakang, email, nomorTelepon, username, kataSandi} = req.body
    connection.query(`UPDATE akun SET namaDepan='${namaDepan}', namaBelakang='${namaBelakang}', email='${email}',
    nomorTelepon=${nomorTelepon}, username='${username}', kataSandi='${kataSandi}' WHERE username=${decoded};`,
    (err, results, field) => {
        if (err){
            throw(err)
        }
        res.send('ok')
    })
    
})

app.post('/change-data', [validateToken], async (req, res) => {
    console.log(req.body)
    const {namaDepan, namaBelakang, email, nomorTelepon, username, password} = req.body
    const decoded = res.locals.token
    connection.query(`UPDATE akun SET namaDepan='${namaDepan}', namaBelakang='${namaBelakang}', email='${email}',
    nomorTelepon=${nomorTelepon}, username='${username}', kataSandi='${password}' WHERE username='${decoded.username}';`,
    (err, results, field) => {
        if (err){
            throw(err)
        }
        res.send('ok')
    })
    
})

    
// })

app.listen(3000, () => {
    console.log('server berjalan')

})