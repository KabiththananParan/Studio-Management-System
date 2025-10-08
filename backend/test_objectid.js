import mongoose from "mongoose";

// Test the ObjectId that's failing
const testId = "68de215ffec1585384af408b";

console.log("Testing ObjectId:", testId);
console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(testId));

try {
  const objectId = new mongoose.Types.ObjectId(testId);
  console.log("ObjectId created successfully:", objectId);
} catch (error) {
  console.log("Error creating ObjectId:", error.message);
}

// Let's also check the length
console.log("ID length:", testId.length);
console.log("Expected length: 24");

// Check if it matches the pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
console.log("Matches ObjectId pattern:", objectIdPattern.test(testId));