const mongoose = require("mongoose");

const toDoSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  checkList: [{ value: Boolean, content: String }],
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdTime: { type: String, required: true },
  workTime: { type: Number, required: true },
  workHour: { type: Number, required: true },
  workMinute: { type: Number, required: true },
  progress: { type: Number, required: true },
  priority: { type: Number, required: true },
  desireToDo: { type: Number, required: true },
  avodiance: { type: Number, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("ToDo", toDoSchema);
