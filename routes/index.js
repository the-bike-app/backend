const { Router } = require('express')
const controllers = require('../controllers')
const router = Router()
const restrict = require('../helpers')

router.get('/', (req, res) => res.send('I Love Bikes!'))

router.post('/sign-up', controllers.signUp)
router.post('/sign-in', controllers.signIn)
router.post('/change-password', controllers.changePassword)

router.get('/bikes', controllers.getAllBikes)
router.get('/users', controllers.getAllUsers)
router.get('/users/:user_id', controllers.getUserById)
router.get('/my-bikes/:user_id', controllers.getUsersBikes)
router.get('/bikes/:bike_id', controllers.getBikeById)
router.post('/send-offer', controllers.sendOffer)
router.post('/create-bike', restrict, controllers.createBike)
router.put('/update-bike/:bike_id', restrict, controllers.updateBike)
router.delete('/delete-bike/:bike_id', restrict, controllers.deleteBike)

router.get('/verify', controllers.verifyUser)

module.exports = router
