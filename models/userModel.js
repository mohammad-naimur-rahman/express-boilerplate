const mongoose = require('mongoose')

// Authenticate will be controlled by firebase and express together, that's why no user password is not in the model, jwt will be handled by this application
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true
    },
    photo: {
      type: String,
      default:
        'https://lh3.googleusercontent.com/proxy/GQSXMpICRbLt6dY9YZ0b-BsC1DFb5oTadGb5WFM-CDyweW4lthnioXozCsDGSPL4Hp_8NR7wJ8ugfUIvAIKxm1VBTj72fdGHS1KpTSDCxuW3IEgpwrKM-G_k7I_VzJG8cQ'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', userSchema)
