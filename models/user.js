import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "customer",
    required: true,
  },

  isBlocked: {
    type: Boolean,
    default: false,
    required: true,
  },

  img: {
    type: String,
    required: false,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
});

const User = mongoose.model("users", userSchema);
export default User;
