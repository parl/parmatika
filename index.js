
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

//declaring password for token
const secret = "secret"

app.post('/akun', (req, res) => {
    const {email, name, age, date_birth, phone_number, password, role} = req.body
    connection.query(`INSERT INTO user (email, name, age, date_birth, phone_number, password, role) values ('${email}','${name}',${age},'${date_birth}','${phone_number}','${password}','${role}')`, 
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
    const{email, password} = req.body
    connection.query(`SELECT * FROM user WHERE email = '${email}'`, (err,results,field) =>{
        if (err){
            console.log(err)
            return res.status(400)
        }
        if (results[0].password != password){
            return res.send(401)   
        }
        const token = jwt.sign({email}, secret)
        const data = {}
        data[0] = token
        data[1] = results[0].role
        return res.json({data})
        
    })
})

// app.post('/pendaftar', [validateToken], async (req, res) => {
//     const decoded = res.locals.token
//     const email = decoded.email
//     connection.query(`SELECT * FROM user JOIN lamaran ON user.id_user = lamaran.id_pelamar  WHERE email_perekrut = '${email}'`, (err, results) => {
//         if (err){
//             console.log(err)
//             throw(err)
//         }
//         let name = {}
//         let phone_number = {}
//         let job_title = {}

//         for(let i=0; i<results.length; i++){
//             name[i] = results[i].name
//             phone_number[i] = results[i].phone_number
//         }   
//         //res.send(results)
//         connection.query(`SELECT pekerjaan.job_title FROM pekerjaan, lamaran WHERE pekerjaan.email_perekrut = '${email}' AND lamaran.email_perekrut = '${email}' `, (err2, results2) => {
//             if (err2){
//                 console.log(err2)
//                 throw(err2)
//             }
//             for(let i=0; i<results.length; i++){
//                 job_title[i] = results2[i].job_title
//             }   
//             res.json({name, phone_number, job_title})
//         })
//     })
// })

//menampilkan daftar pekerjaan berdasarkan pembuat
app.get('/post', [validateToken], async (req,res) => {
    const decoded = res.locals.token
    const email = decoded.email
    connection.query(`SELECT * FROM pekerjaan WHERE email_perekrut = '${email}'`, (err, results) => {
        if (err){
            console.log(err)
            throw(err)
        }
        res.send(results)
    })
})

//memasukkan pekerjaan baru
app.post('/lamar', [validateToken], async (req,res) => {
    const decoded = res.locals.token
    const email = decoded.email
    const {job_title, salary, location, description} = req.body
    connection.query(`INSERT INTO pekerjaan (job_title, salary, location, description, email_perekrut) values ('${job_title}','${salary}','${location}','${description}','${email}')`, (err, results) => {
        if (err){
            console.log(err)
            throw(err)
        }
        res.send(results)
    })
})

//menampilkan semua daftar pekerjaan
app.get('/kerjaan', async (req,res) => {
    connection.query(`SELECT * FROM pekerjaan`, (err, results) => {
        if (err){
            console.log(err)
            throw(err)
        }
        console.log()
        res.send(results)
    })
})

app.get('/nama', [validateToken], async (req,res) => {
    const decoded = res.locals.token
    const email = decoded.email
    connection.query(`SELECT name FROM user WHERE email = '${email}'`, (err, results) => {
        if (err){
            console.log(err)
            throw(err)
        }
        console.log()
        const nama = results[0].name
        res.json(nama)
    })
})

app.post('/masukkan', [validateToken], async (req,res) => {
    const decoded = res.locals.token
    const email_pelamar = decoded.email
    const {email_perekrut, id_pekerjaan} = req.body
    
    connection.query(`SELECT id_user FROM user WHERE email = '${email_pelamar}'`, (err1,results1) => {
        if (err1){
            throw(err1)
        }
        connection.query(`SELECT id_user FROM user WHERE email = '${email_perekrut}'`, (err2,results2) => {
            if (err2){
                throw(err2)
            }
            connection.query(`INSERT INTO lamaran (email_perekrut, email_pelamar, id_pelamar, id_perekrut, id_pekerjaan) values ('${email_perekrut}','${email_pelamar}',${results1[0].id_user},${results2[0].id_user},${id_pekerjaan})`)
        })    
    
    })
    
    
})

app.listen(3000, () => {
    console.log('server berjalan')

})