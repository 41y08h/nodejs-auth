const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const __JWT_SECRET__ = "insecure-defined-here";

const UserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().label("Username"),
  password: Joi.string().min(6).max(30).required().label("Password"),
});

const users = [];

const app = express();
app.use(express.json());

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate the user input
  const { error } = UserSchema.validate({ username, password });
  if (error) return res.status(400).send(error.message);

  // Check if the user already exists
  const user = users.find((u) => u.username === username);
  if (user) {
    return res.status(409).send({
      error: {
        message: "User already exists",
        code: 409,
      },
    });
  }

  // Create a new user
  const newUser = {
    id: users.length + 1,
    username,
    password,
  };
  users.push(newUser);

  // Generate a token
  const token = jwt.sign({ username: newUser.username }, __JWT_SECRET__);

  // Send the token
  res.status(201).send({ token });

  console.log(users);
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
