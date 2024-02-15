import { User } from "../models/users.js";
import argon2 from "argon2";

export const createUser = async function (
  user_name: string,
  email: string,
  password: string
) {
  // Encrypt the password using argon2
  const hashedPassword = await argon2.hash(password);

  const user = new User({
    user_name: user_name,
    email: email,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }
};
