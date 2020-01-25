const express = require('express')
const app = express()
// https://www.npmjs.com/package/morgan
// permet d'avoir un debug en console
const morgan = require('morgan')('dev')
// require des fonctions {utilisateur}
const { success, error, checkAndChange } = require('./assets/function')
// fichier de configuration
const config = require('./assets/config')
const bodyparser = require('body-parser')
const mysql = require('promise-mysql')

const db = mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected to MYSQL');
    // middleware
    app.use(morgan)
    app.use(bodyparser.json())
    app.use(bodyparser.urlencoded({ extended: true }))

    // class Members
    let MembersRouter = express.Router()
    let Members = require('./assets/classes/Members')(db, config)

    /* --------------------------------- routes --------------------------------- */
    MembersRouter.route('/:id')
        // recuperation d'un membre avec son id
        .get(async (req, res) => {
            let member = await Members.getById(req.params.id)
            res.json(checkAndChange(member))
        })
        // Modifie un membre avec ID
        .put(async (req, res) => {
            let updateMember = await Members.update(req.params.id, req.body.name)
            res.json(checkAndChange(updateMember))
        })
        // Supprime un membre avec ID
        .delete(async (req, res) => {
            let deleteMember = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMember))
        })
    MembersRouter.route('/')
        // Récupère tous les membres
        .get(async (req, res) => {
            let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })
        // Ajoute un membre avec son nom
        .post(async (req, res) => {
            let addMember = await Members.add(req.body.name)
            res.json(checkAndChange(addMember))
        })

    app.listen(config.port, () => console.log('Started on port ' + config.port))
    app.use(config.rootAPI + 'members', MembersRouter)
}).catch((err) => {
    console.log('erreur => ', err.message);
})
