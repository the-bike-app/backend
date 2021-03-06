const db = require('../db')
const User = require('../models/user')
const Bike = require('../models/bike')
const imgUrl = require('./img')
const faker = require('faker')

let seedLength = 15

const brand = ['Bianchi', 'Diamondback', 'Firmstrong', 'Giant', 'Huffy', 'Kestral', 'Mongoose', 'Raleigh', 'Retrospec', 'Santa Cruz', 'Schwinn', 'Specialized', 'Strider', 'Trek Bikes', 'Vilano']
const type = ['BMX', 'Cruiser', 'Folding', 'Hybrid', 'Mountain', 'Road', 'Tandem', 'Touring', 'Track', 'Urban']
const location = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island']

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const bikesArray = []
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
        description: faker.lorem.paragraph(),
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