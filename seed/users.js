const db = require('../db')
const User = require('../models/user')
const Bike = require('../models/bike')
const faker = require('faker')

let seedLength = 100

const brand = ['Bianchi', 'Diamondback', 'Firmstrong', 'Giant', 'Huffy', 'Kestral', 'Mongoose', 'Raleigh', 'Retrospec', 'Santa Cruz', 'Schwinn', 'Specialized', 'Strider', 'Trek Bikes', 'Vilano']
const type = ['BMX', 'Cruiser', 'Folding', 'Hybrid', 'Mountain', 'Road', 'Tandem', 'Touring', 'Track', 'Urban']
const location = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island']
const imgUrl = ['/img/BMX-bike.png', '/img/cruiser-bike.jpeg', '/img/folding-bike.jpg', '/img/hybrid-bike.jpg', '/img/mountain-bike.jpg', '/img/road-bike.jpg', '/img/road-bike.jpg', '/img/tandem-bike.jpg', '/img/track-bike.jpg', '/img/urban-bike.jpg']


db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const bikesArray = ['fake_' + faker.random.uuid(), 'fake_' + faker.random.uuid(), 'fake_' + faker.random.uuid()]
const userIds = []

const main = async () => {
  const users = [...Array(seedLength)].map(user => (
    {
      username: faker.name.firstName(),
      email: faker.internet.email(),
      password_digest: faker.random.uuid(),
      users_bikes: bikesArray
    }
  ))

  const createdUsers = await User.insertMany(users)
  createdUsers.map((user) => {
    userIds.push(user._id)
    return userIds
  })
  console.log("Created Users w/ the Following Ids.", userIds)
}

const seedBikes = async () => {
  const bikes = [...Array(seedLength)].map((bike, index) => {
    let randNum = Math.floor(Math.random() * 10)
    return (
      {
        brand: brand[Math.floor(Math.random() * brand.length)],
        type: type[randNum],
        location: location[Math.floor(Math.random() * location.length)],
        price: Math.floor((Math.random() * 1000) + 100),
        image: imgUrl[randNum],
        user: userIds[index]
      }
    )
  })

  await Bike.insertMany(bikes)
  console.log("Created Bikes!")
}

const run = async () => {
  await main()
  await seedBikes()
  db.close()
}

run()