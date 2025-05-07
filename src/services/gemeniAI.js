// import express from "express";
// import bodyParser from "body-parser";
// import GoogleStrategy from "passport-google-oauth2";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from dotenv;

// const router = express.Router();

// dotenv.config();
// // const BASE_URL =
// //   "https://generativeai.googleapis.com/v1beta3/models/gemini-1.5-flash:generateText";
// // const { GoogleGenerativeAI } = require("@google/generative-ai");

// const gemini_API = process.env.GOOGLE_GEMINI_API;

// // AI model declaration
// // const genAI = new GoogleGenerativeAI(gemini_API);
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const genAI = new GoogleGenerativeAI(gemini_API);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// router.post("/ai", async (req, res) => {
//   const data = await getbooks();
//   const formatedData = data
//     .map(
//       (book) => `
//  id:${book.id} ,
//  name:${book.bookTitle},
//  author:${book.bookAuthor},
//  comment:${book.book_comment},
//  rating:${book.book_rating} `
//     )
//     .join("\n");

//   const question = req.body.question;
//   console.log(question);
//   const prompt = `Analyze the following data:\n${formatedData}\n\n and give me ${question} without  any explanation just the content information and put each data with diffrent id in difrent number and object in array`;
//   console.log(prompt);
//   try {
//     // Call the AI model
//     const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);

//     const aiResponse = result.response.text();
//     const cleanedResponse = aiResponse.replace(/```json|```|\n/g, "").trim();
//     //const parsValue = JSON.parse(aiResponse);
//     const parseValue = JSON.parse(cleanedResponse);
//     const message = parseValue.map((item) => `Message:${item.comment}`);
//     console.log(message);

//     res.render("pages/ai/test", { message: result.response.text() });
//   } catch (error) {
//     console.error("Error generating AI response:", error.message);
//     res.render("test", {
//       message: "An error occurred while generating AI response.",
//     });
//   }
// });

// export default router;
