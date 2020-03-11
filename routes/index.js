const { Router } = require('express')
const controllers = require('../controllers')
const router = Router()
const restrict = require('../helpers')

router.get('/', (req, res) => res.send('This is root!'))

router.post('/sign-up', controllers.signUp)
router.post('/sign-in', controllers.signIn)
router.post('/change-password', controllers.changePassword)

router.get('/bikes', controllers.getAllBikes)
router.get('/users', controllers.getAllUsers)
router.get('/my-bikes/:user_id', controllers.getUsersBikes)
router.get('/bikes/:bike_id', controllers.getBikeById)
router.post('/create-bike', restrict, controllers.createBike)
router.put('/update-bike/:bike_id', restrict, controllers.updateBike)
router.delete('/delete-bike/:bike_id', restrict, controllers.deleteBike)

module.exports = router