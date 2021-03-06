const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const __JWT_SECRET__ = "insecure-defined-here";

const UserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().label("Username"),
  password: Joi.string().min(6).max(30).required().label("Password"),
});

const users = [
  {
    id: 1,
    username: "admin",
    password: "password",
  },
  {
    id: 2,
    username: "user",
    password: "password",
  },
  {
    id: 3,
    username: "guest",
    password: "password",
  },
];

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate the user input
  const { error } = UserSchema.validate({ username, password });
  if (error)
    return res.status(400).send({
      error: {
        message: error.message,
        code: 400,
      },
    });

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
  const token = jwt.sign({ username: newUser.username }, __JWT_SECRET__, {
    expiresIn: "7d",
  });

  // Send the token
  res.status(201).send({ token });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate the user input
  const { error } = UserSchema.validate({ username, password });
  if (error)
    return res.status(400).send({
      error: {
        message: error.message,
        code: 400,
      },
    });

  // Check if the user exists
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).send({
      error: {
        message: "Invalid username or password",
        code: 400,
      },
    });
  }

  // Check if the password is correct
  if (user.password !== password) {
    return res.status(401).send({
      error: {
        message: "Invalid username or password",
        code: 400,
      },
    });
  }

  // Generate a token
  const token = jwt.sign({ username: user.username }, __JWT_SECRET__, {
    expiresIn: "7d",
  });

  // Send the token
  res.status(200).send({ token });
});

app.get("/current-user", (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({
      error: {
        message: "Unauthorized",
        code: 401,
      },
    });
  }

  // Verify the token
  const token = authorization.replace("Bearer ", "");
  try {
    const { username } = jwt.verify(token, __JWT_SECRET__);
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).send({
        error: {
          message: "Unauthorized",
          code: 401,
        },
      });
    }

    // Send the user
    res.status(200).send({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    return res.status(401).send({
      error: {
        message: "Unauthorized",
        code: 401,
      },
    });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
