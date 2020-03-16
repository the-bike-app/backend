const { Router } = require('express')
const controllers = require('../controllers')
const router = Router()
const cors = require('cors')
const restrict = require('../helpers')

router.get('/', (req, res) => res.send('I Love Bikes!'))

router.post('/sign-up', cors(), controllers.signUp)
router.post('/sign-in', cors(), controllers.signIn)
router.post('/change-password', cors(), controllers.changePassword)

router.get('/bikes', cors(), controllers.getAllBikes)
router.get('/users', cors(), controllers.getAllUsers)
router.get('/users/:user_id', cors(), controllers.getUserById)
router.get('/my-bikes/:user_id', cors(), controllers.getUsersBikes)
router.get('/bikes/:bike_id', cors(), controllers.getBikeById)
router.post('/create-bike', cors(), restrict, controllers.createBike)
router.put('/update-bike/:bike_id', cors(), restrict, controllers.updateBike)
router.delete('/delete-bike/:bike_id', cors(), restrict, controllers.deleteBike)

router.get('/verify', cors(), controllers.verifyUser)

module.exports = router
