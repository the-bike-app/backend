const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Bike = require('../models/bike')
const db = require('../db')
const slackSender = require('./slackMessages')
const sendEmail = require('./emailer')
const { signUpMessage, changePwMessage } = require('./emailTemplates')

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
    const slackPayload = {
      text:
        `UserID:${user._id}
        User Name:${user.username}
        Email:${user.email}
        from IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
    }
    console.log(payload)

    slackSender(process.env.SLACK_URL + process.env.SLACK_SIGN_UP, slackPayload)
    const token = jwt.sign(payload, TOKEN_KEY)
    console.log(token)
    sendEmail(user.username, user.email, signUpMessage, 'Welcome to Wheel Deals!')

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
      const slackPayload = {
        text:
          `UserID:${user._id}
          User Name:${user.username}
          Email:${user.email}
          from IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
      }
      const token = jwt.sign(payload, TOKEN_KEY)
      slackSender(process.env.SLACK_URL + process.env.SLACK_SIGN_IN, slackPayload)
      return res.status(201).json({ user, token })
    } else {
      res.status(401).send('Invalid Credentials')
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, id } = req.body;
  const user = await User.findById(id)
  console.log(user, req.body)
  if (await bcrypt.compare(oldPassword, user.password_digest)) {
    const password_digest = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await User.findByIdAndUpdate(id, { password_digest: password_digest }, { new: true }, (err, user) => {
      if (err) {
        res.status(500).send('Password error:', err);
      }
      const slackPayload = {
        text: `User Id: ${id} updated their password from IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
      }
      slackSender(process.env.SLACK_URL + process.env.SLACK_CHANGE_PW, slackPayload)
      sendEmail(user.username, user.email, changePwMessage, 'Alert - Password Was Changed!')
      return res.status(200).json(user)
    })
  } else
    return res.status(469).send('Old Password Is Incorrect!')
}

const getAllBikes = async (req, res) => {
  const payload = {
    text: `Browsed Bikes was accessed from IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
  }
  try {
    const bikes = await Bike.find()
    slackSender(process.env.SLACK_URL + process.env.SLACK_ALL_BIKES, payload)
    return res.status(200).json({ bikes })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

// ******   testing purposes only   ******
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params
    const user = await User.findById(user_id)
    if (user) {
      return res.status(200).json({ user })
    }
    return res.status(404).send('This User Does Not Exist')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

const getUsersBikes = async (req, res) => {
  try {
    const { user_id } = req.params
    const user = await User.findById(user_id)
    const userBikeIds = user.users_bikes
    return res.status(200).json({ userBikeIds })
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
    const newBike = await bike.save()
    const slackPayload = {
      text: `New Bike Created by IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
    }
    slackSender(process.env.SLACK_URL + process.env.SLACK_CREATE_BIKE, slackPayload)

    const thisUser = await User.findOne(newBike.user)
    const newBikeArray = thisUser.users_bikes
    newBikeArray.push(newBike._id)
    const userId = newBike.user

    await User.findByIdAndUpdate(userId, { users_bikes: newBikeArray }, { new: true }, (err, bike) => {
      if (err) {
        res.status(500).send(err);
      }
      if (!bike) {
        res.status(500).send('Can not be updated, this bike does not exist!');
      }
      return res.status(200).json(bike)
    })


    return res.status(201).json(newBike)
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
      const slackPayload = {
        text: `A Bike was updated by IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
      }
      slackSender(process.env.SLACK_URL + process.env.SLACK_EDIT_BIKE, slackPayload)
      return res.status(200).json(bike)
    })
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

const deleteBike = async (req, res) => {
  try {
    const { bike_id } = req.params;
    const bike = await Bike.findById(bike_id)

    const user = await User.findById(bike.user)
    const newBikeArray = user.users_bikes.filter(item => item !== bike_id)


    await User.findByIdAndUpdate(bike.user, { users_bikes: newBikeArray }, { new: true }, (err, bike) => {
      if (err) {
        res.status(500).send(err);
      }
      if (!bike) {
        res.status(500).send('Can not be updated, this bike does not exist!');
      }
      return res.status(200).json(bike)
    })

    const deleted = await Bike.findByIdAndDelete(bike_id)
    if (deleted) {
      const slackPayload = {
        text: `Bike ID:${bike_id} was deleted by IP:${req.connection.remoteAddress.replace('::ffff:', '')}`
      }
      slackSender(process.env.SLACK_URL + process.env.SLACK_DELETED, slackPayload)
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
  getUserById,
  getUsersBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  verifyUser
}