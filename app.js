const express = require('express')
const app = express()
// module de creation de documentation
// https://www.npmjs.com/package/swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./bin/config/swagger');
// https://www.npmjs.com/package/morgan
// permet d'avoir un debug en console
const morgan = require('morgan')('dev')
// require des fonctions {utilisateur}
const { success, error, checkAndChange } = require('./bin/utils/function')
// fichier de configuration
const config = require('./bin/config/config')
const bodyparser = require('body-parser')
const mysql = require('promise-mysql')

const db = mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected to MYSQL :)');
    // middleware
    app.use(morgan)
    app.use(bodyparser.json())
    app.use(bodyparser.urlencoded({ extended: true }))
    
    // swagger ui doc api
    let customCssSwagger = {
        customCss: `.swagger-ui .topbar { display: none }`
    };
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, customCssSwagger));
 

    // class Members
    let MembersRouter = express.Router()
    let Members = require('./bin/class/Members')(db, config)

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

    app.listen(config.port, () => console.log('- Started on port ' + config.port, ': http://localhost:' + config.port) + console.log('- DOCS API on : ' + 'http://localhost:' + config.port + '/docs'))
    app.use(config.rootAPI + 'members', MembersRouter)
}).catch((err) => {
    console.log('erreur => ', err.message);
})
