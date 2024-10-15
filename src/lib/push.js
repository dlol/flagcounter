const sqlite3 = require('sqlite3')

const config = require('../../config.json')
const db_file = process.env.FC_DB_FILE || config.db
const cloudflare = process.env.FC_CLOUDFLARE || config.cloudflare

const db = new sqlite3.Database(db_file)

function pushDB(req) {
    let ip = cloudflare ? req.header('CF-Connecting-IP') : req.ip
    db.get('SELECT * FROM flagcounter WHERE ip = ?', [ip], async (err, row) => {
        if (!err) {
            if (!row) { // checks if the ip is not already present on the database
                let country
                if (!cloudflare) {
                    let ipInfo = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`).then(res => res.json())
                    country = ipInfo.status === 'success' ? ipInfo.countryCode.toLowerCase() : null
                } else {
                    country = req.header('Cf-Ipcountry') ? req.header('Cf-Ipcountry').toLowerCase() : null
                }
    
                db.run('INSERT INTO flagcounter (ip, country) VALUES (?, ?)', [ip, country], (err) => {
                    if (err) {
                        console.error(err)
                        res.status(500).render("error", {
                            title: "HTTP Error 500",
                            desc: "Internal Server Error",
                            root
                        })
                    }
                })
            }
        } else {
            console.error(err)
            res.status(500).render("error", {
                title: "HTTP Error 500",
                desc: "Internal Server Error",
                root
            })
        }
    })
}

module.exports = pushDB
