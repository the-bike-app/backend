const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Bike = new Schema(
  {
    brand: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('bikes', Bike)
