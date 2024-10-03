const express = require('express')
const sqlite3 = require('sqlite3')
const fs = require('fs')
const path = require('path')

const themify = require('./lib/themify')
const pushDB = require('./lib/push')

const config = require('../config.json')
console.log('Your config.json file:')
console.log(config)
const root = config.root
const port = config.port
const title = config.title
const db_file = config.db

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('trust proxy', true)
app.use(root, express.static(path.join(__dirname, 'static')))

const db = new sqlite3.Database(db_file)
const create_db_query = `CREATE TABLE flagcounter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    country TEXT CHECK(length(country) <= 2)
);`

db.run(create_db_query, (err) => {
    if (!err) {
        console.log(
            `Database \"${db_file}\" not found. Database and table created successfully.`
        )
    } else {
        console.error(err)
    }
})

app.get(root, async (req, res) => {
    res.render("index", {
        title,
        root
    })

    pushDB(req)
})

app.get(`${root}counter`, async (req, res) => {
    let { theme = 'moebooru' } = req.query
    let demo = req.query.demo
    let digits = req.query.digits

    db.all('SELECT * FROM flagcounter', (err, rows) => {
        if (!err) {
            let count = demo ? 123456780 : Number(new Set(rows.map(entry => entry.ip)).size)
            let length = digits ? digits : String(count).length
            let renderSvg = themify.getCountImage({ count, theme, length })
            
            res
                .set({
                    'content-type': 'image/svg+xml',
                    'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
                })
                .send(renderSvg)
        } else {
            console.error(err)
            res.status(500).render("error", {
                title: "HTTP Error 500",
                desc: "Internal Server Error",
                root
            })
        }
    })

    pushDB(req)
})

app.get(`${root}flags`, async (req, res) => {
    db.all('SELECT * FROM flagcounter', (err, rows) => {
        if (!err) {
            res.render("flags", {
                title,
                root,
                rows
            })
        } else {
            console.error(err)
            res.status(500).render("reply", {
                title: "HTTP Error 500",
                desc: "Internal Server Error",
                root
            })
        }
    })

    pushDB(req)
})

app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'HTTP Error 404',
        desc: 'You have probably lost yourself... This page does not exist.',
        root
    })

    pushDB(req)
})

app.listen(port, () => {
    console.log(`Web Server is available at http://localhost:${port}${root}.`)
})
