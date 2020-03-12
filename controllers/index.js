const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Bike = require('../models/bike')
const db = require('../db')

db.on('error', console.error.bind(console, 'MongoDB connection error:'))


const SALT_ROUNDS = 11
const TOKEN_KEY = process.env.TOKEN_KEY

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const password_digest = await bcrypt.hash(password, SALT_ROUNDS)
    const user = new User({
      username,
      email,
      password_digest
    })

    await user.save()
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email
    }
    console.log(payload)
    const token = jwt.sign(payload, TOKEN_KEY)
    console.log(token)
    return res.status(201).json({ user, token })
  } catch (error) {
    console.log(
      'You made it to the signUp controller, but there was an error :('
    )
    return res.status(400).json({ error: error.message })
  }
}

const signIn = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username: username })
    if (await bcrypt.compare(password, user.password_digest)) {
      const payload = {
        id: user._id,
        username: user.username,
        email: user.email
      }

      const token = jwt.sign(payload, TOKEN_KEY)
      return res.status(201).json({ user, token })
    } else {
      res.status(401).send('Invalid Credentials')
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const changePassword = async (req, res) => {

}

const getAllBikes = async (req, res) => {
  try {
    const bikes = await Bike.find()
    return res.status(200).json({ bikes })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const getUsersBikes = async (req, res) => {
  try {
    const { user_id } = req.params
    const user = await User.findById(user_id)
    const userBikeIds = user.users_bikes
    const usersBikes = userBikeIds.map((id) => {
      Bike.findById(id)
    })
    return res.status(200).json({ usersBikes, userBikeIds, })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const getBikeById = async (req, res) => {
  try {
    const { bike_id } = req.params
    const bike = await Bike.findById(bike_id)
    if (bike) {
      return res.status(200).json({ bike })
    }
    return res.status(404).send('This Bike Does Not Exist')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const createBike = async (req, res) => {
  try {
    const bike = await new Bike(req.body)
    await bike.save()
    const filter = { id: req.params.user._id };
    const update = { users_bikes: 'add to array' };
    await User.findOneAndUpdate(filter, update, { new: true });
    return res.status(201).json(bike)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const updateBike = async (req, res) => {
  try {
    const { bike_id } = req.params;
    await Bike.findByIdAndUpdate(bike_id, req.body, { new: true }, (err, bike) => {
      if (err) {
        res.status(500).send(err);
      }
      if (!bike) {
        res.status(500).send('Can not be updated, this bike does not exist!');
      }
      return res.status(200).json(bike)
    })
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

const deleteBike = async (req, res) => {
  try {
    const { bike_id } = req.params;
    const deleted = await Bike.findByIdAndDelete(bike_id)
    if (deleted) {
      return res.status(200).send("Bike was deleted");
    }
    throw new Error("Bike was not found");
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

const verifyUser = (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const user = jwt.verify(token, TOKEN_KEY);
    res.locals = user;
    res.json({ user: res.locals });
  } catch (e) {
    res.status(401).send('Not Authorized');
  }
}

module.exports = {
  signUp,
  signIn,
  changePassword,
  getAllBikes,
  getAllUsers,
  getUsersBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  verifyUser
}