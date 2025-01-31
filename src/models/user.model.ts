import mongoose, { Schema, Document } from "mongoose";
import { any } from "webidl-conversions";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  generateAuthToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
/* 
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
}; */

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
