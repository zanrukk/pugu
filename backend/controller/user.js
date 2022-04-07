const User = require("../models/user");
const ToDo = require("../models/toDo");
const ObjectID = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");

function calculateAreas(width, height, todos) {
  //task valuelarını ekrandaki alana göre oranlıyor.
  const area = width * height;
  let total = 0;
  for (let i = 0; i < todos.length; i++) total += todos[i].area;

  let x = area / total;

  for (let i = 0; i < todos.length; i++) todos[i].area = todos[i].area * x;
}

function treeMap(width, height, x, y, todos, value1, value2, index) {
  if (Math.abs(1 - value1) < Math.abs(1 - value2)) {
    if (width < height) {
      let totalArea = 0;
      for (let i = 0; i < index - 1; i++) {
        totalArea += todos[i].area;
      }
      for (let i = 0; i < index - 1; i++) {
        let ratio = width / totalArea;
        todos[i].width = todos[i].area * ratio;
        todos[i].height = todos[i].area / todos[i].width;
      }
      let thisX = x;
      for (let i = 0; i < index - 1; i++) {
        todos[i].positionX = thisX;
        todos[i].positionY = y;
        thisX += todos[i].width;
      }

      y += todos[0].height;
      height = height - todos[0].height;
      for (let i = 0; i < index - 1; i++) todos.shift();
      if (todos.length === 1) {
        todos[0].positionX = x;
        todos[0].positionY = y;
        todos[0].width = width;
        todos[0].height = height;
        return;
      } else treeMap(width, height, x, y, todos, 999, 998, 0);
    } else {
      let totalArea = 0;
      for (let i = 0; i < index - 1; i++) totalArea += todos[i].area;
      for (let i = 0; i < index - 1; i++) {
        let ratio = height / totalArea;
        todos[i].height = todos[i].area * ratio;
        todos[i].width = todos[i].area / todos[i].height;
      }
      let thisY = y;
      for (let i = 0; i < index - 1; i++) {
        todos[i].positionY = thisY;
        todos[i].positionX = x;
        thisY += todos[i].height;
      }

      x += todos[0].width;
      width = width - todos[0].width;
      for (let i = 0; i < index - 1; i++) todos.shift();
      if (todos.length === 1) {
        todos[0].positionX = x;
        todos[0].positionY = y;
        todos[0].width = width;
        todos[0].height = height;
        return;
      } else treeMap(width, height, x, y, todos, 999, 998, 0);
    }
  } else {
    if (index >= todos.length) {
      return;
    }
    if (width < height) {
      let totalArea = 0;
      for (let i = 0; i <= index; i++) totalArea += todos[i].area;
      for (let i = 0; i <= index; i++) {
        let ratio = width / totalArea;
        todos[i].width = todos[i].area * ratio;
        todos[i].height = todos[i].area / todos[i].width;
      }
      let thisX = x;
      for (let i = 0; i <= index; i++) {
        todos[i].positionX = thisX;
        todos[i].positionY = y;
        thisX += todos[i].width;
      }
      value1 = value2;
      value2 = todos[index].width / todos[index].height;
      treeMap(width, height, x, y, todos, value1, value2, ++index);
    } else {
      let totalArea = 0;
      for (let i = 0; i <= index; i++) totalArea += todos[i].area;
      for (let i = 0; i <= index; i++) {
        let ratio = height / totalArea;
        todos[i].height = todos[i].area * ratio;
        todos[i].width = todos[i].area / todos[i].height;
      }
      let thisY = y;
      for (let i = 0; i <= index; i++) {
        todos[i].positionY = thisY;
        todos[i].positionX = x;
        thisY += todos[i].height;
      }
      value1 = value2;
      value2 = todos[index].height / todos[index].width;
      treeMap(width, height, x, y, todos, value1, value2, ++index);
    }
  }
}

exports.GetHasFilled = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user) return res.status(400).send("There is no user with this id!");
    res.status(200).json({
      hasFilled: user.hasFilled,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.FillSurvey = async (req, res, next) => {
  try {
    if (
      req.body.age <= 0 ||
      req.body.age > 120 ||
      req.body.age === null ||
      req.body.age === undefined
    ) {
      res.status(400).json({
        message: "Age must be between 1 and 120!",
      });
      return;
    }
    if (
      req.body.distrac > 10 ||
      req.body.distrac <= 0 ||
      req.body.distrac === null ||
      req.body.distrac === undefined
    ) {
      res.status(400).json({
        message: "Invalid distractibility value!",
      });
      return;
    }
    if (
      req.body.impul > 10 ||
      req.body.impul <= 0 ||
      req.body.impul === null ||
      req.body.impul === undefined
    ) {
      res.status(400).json({
        message: "Invalid impulsiveness value!",
      });
      return;
    }
    if (
      req.body.lackOfSelfControl > 10 ||
      req.body.lackOfSelfControl <= 0 ||
      req.body.lackOfSelfControl === null ||
      req.body.lackOfSelfControl === undefined
    ) {
      res.status(400).json({
        message: "Invalid lackOfSelfControl value!",
      });
      return;
    }
    let age = req.body.age;
    let realAge = age;
    age -= 1;
    age = age / 13.22;
    age = age + 1;
    if (age > 10) {
      age = 10;
    }
    let distrac = req.body.distrac;
    let impul = req.body.impul;
    let lackOfSelfControl = req.body.lackOfSelfControl;
    //makaleden aldığımız katsayılar age için -.48 distract için .45 impul için .41 losc için .58
    let result =
      age * -0.48 + distrac * 0.45 + impul * 0.41 + lackOfSelfControl * 0.58;
    result = result + 3.36;
    result = result / 1.92;
    result += 1;
    if (result > 10) {
      result = 10;
    }
    await User.findOneAndUpdate(
      { _id: req.userData.userId },
      {
        age: realAge,
        distractibility: distrac,
        impulsiveness: impul,
        lackOfSelfControl: lackOfSelfControl,
        procrastination: result,
        hasFilled: true,
      }
    );
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.CreateToDo = async (req, res, next) => {
  try {
    if (
      req.body.title === "" ||
      req.body.title === undefined ||
      req.body.title === null
    ) {
      res.status(400).json({
        message: "Title is required!",
      });
      return;
    }
    if (
      req.body.description === "" ||
      req.body.description === undefined ||
      req.body.description === null
    ) {
      res.status(400).json({
        message: "Description is required!",
      });
      return;
    }
    if (
      req.body.startTime === "" ||
      req.body.startTime === undefined ||
      req.body.startTime === null
    ) {
      res.status(400).json({
        message: "Start time is required!",
      });
      return;
    }
    if (
      req.body.endTime === "" ||
      req.body.endTime === undefined ||
      req.body.endTime === null
    ) {
      res.status(400).json({
        message: "End time is required!",
      });
      return;
    }
    if (
      req.body.estimatedTime === undefined ||
      req.body.estimatedTime === null
    ) {
      res.status(400).json({
        message: "Estimated time is required!",
      });
      return;
    }
    if (
      req.body.priority > 10 ||
      req.body.priority <= 0 ||
      req.body.priority === null ||
      req.body.priority === undefined
    ) {
      res.status(400).json({
        message: "Priority is required!",
      });
      return;
    }
    if (
      req.body.desireToDo > 10 ||
      req.body.desireToDo <= 0 ||
      req.body.desireToDo === null ||
      req.body.desireToDo === undefined
    ) {
      res.status(400).json({
        message: "Desire to do is required!",
      });
      return;
    }
    if (
      req.body.avodiance > 10 ||
      req.body.avodiance <= 0 ||
      req.body.avodiance === null ||
      req.body.avodiance === undefined
    ) {
      res.status(400).json({
        message: "Avodiance is required!",
      });
      return;
    }
    if (
      req.body.today === null ||
      req.body.today === undefined ||
      req.body.today === ""
    ) {
      res.status(400).json({
        message: "Invalid",
      });
      return;
    }
    if (
      req.body.startHour === null ||
      req.body.startHour === undefined ||
      req.body.startHour < 0 ||
      req.body.startHour > 23 ||
      req.body.endHour === null ||
      req.body.endHour === undefined ||
      req.body.endHour < 0 ||
      req.body.endHour > 23 ||
      req.body.estimatedHour === null ||
      req.body.estimatedHour === undefined ||
      req.body.estimatedHour < 0 ||
      req.body.estimatedHour > 23 ||
      req.body.startMinute === null ||
      req.body.startMinute === undefined ||
      req.body.startMinute < 0 ||
      req.body.startMinute > 59 ||
      req.body.endMinute === null ||
      req.body.endMinute === undefined ||
      req.body.endMinute < 0 ||
      req.body.endMinute > 59 ||
      req.body.estimatedMinute === null ||
      req.body.estimatedMinute === undefined ||
      req.body.estimatedMinute < 0 ||
      req.body.estimatedMinute > 59
    ) {
      res.status(400).json({
        message: "Please check hour/minute values!",
      });
      return;
    }
    let startHourinMilliSecond = req.body.startHour * 3600000;
    let endHourinMilliSecond = req.body.endHour * 3600000;
    let startMininMilliSecond = req.body.startMinute * 60000;
    let endMininMilliSecond = req.body.endMinute * 60000;
    let endTimeDate = new Date(req.body.endTime);
    let startTimeDate = new Date(req.body.startTime);
    if (
      startTimeDate.setHours(0, 0, 0, 0) +
        startHourinMilliSecond +
        startMininMilliSecond >=
      endTimeDate.setHours(0, 0, 0, 0) +
        endHourinMilliSecond +
        endMininMilliSecond
    ) {
      res.status(400).json({
        message: "Start date cannot be grater than or equal to end time!",
      });
      return;
    }
    if (
      req.body.estimatedTime <= 0 &&
      req.body.estimatedHour <= 0 &&
      req.body.estimatedMinute <= 0
    ) {
      res.status(400).json({
        message: "Estimated time must be greater than 0!",
      });
      return;
    }
    if (
      endTimeDate.setHours(0, 0, 0, 0) +
        endHourinMilliSecond +
        endMininMilliSecond <=
      parseInt(req.body.today)
    ) {
      res.status(400).json({
        message: "End time cannot be smaller than or equal to now!",
      });
      return;
    }
    let CBL = [];
    req.body.checkBoxList.map((c) => {
      if (!c.deleted) {
        const data = {
          value: c.value,
          content: c.content,
        };
        CBL.push(data);
      }
    });
    let CBLSet = new Set(CBL.map((item) => item.content));
    if (CBLSet.size !== CBL.length) {
      res.status(404).json({
        message: "Checkbox item content must be unique!",
      });
      return;
    }
    const toDo = new ToDo({
      userId: req.userData.userId,
      title: req.body.title,
      description: req.body.description,
      checkList: CBL,
      startTime: new Date(
        startTimeDate.setHours(0, 0, 0, 0) +
          startHourinMilliSecond +
          startMininMilliSecond
      ).toString(),
      endTime: new Date(
        endTimeDate.setHours(0, 0, 0, 0) +
          endHourinMilliSecond +
          endMininMilliSecond
      ).toString(),
      createdTime: new Date(req.body.today).toString(),
      workTime: req.body.estimatedTime,
      workHour: req.body.estimatedHour,
      workMinute: req.body.estimatedMinute,
      progress: 0,
      priority: req.body.priority,
      desireToDo: req.body.desireToDo,
      avodiance: req.body.avodiance,
      status: "waiting",
    });
    await toDo.save();
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.EditToDo = async (req, res, next) => {
  try {
    if (
      req.body.title === "" ||
      req.body.title === undefined ||
      req.body.title === null
    ) {
      res.status(400).json({
        message: "Title is required!",
      });
      return;
    }
    if (
      req.body.description === "" ||
      req.body.description === undefined ||
      req.body.description === null
    ) {
      res.status(400).json({
        message: "Description is required!",
      });
      return;
    }
    if (
      req.body.startTime === "" ||
      req.body.startTime === undefined ||
      req.body.startTime === null
    ) {
      res.status(400).json({
        message: "Start time is required!",
      });
      return;
    }
    if (
      req.body.endTime === "" ||
      req.body.endTime === undefined ||
      req.body.endTime === null
    ) {
      res.status(400).json({
        message: "End time is required!",
      });
      return;
    }
    if (
      req.body.estimatedTime === undefined ||
      req.body.estimatedTime === null
    ) {
      res.status(400).json({
        message: "Estimated time is required!",
      });
      return;
    }
    if (
      req.body.priority > 10 ||
      req.body.priority <= 0 ||
      req.body.priority === null ||
      req.body.priority === undefined
    ) {
      res.status(400).json({
        message: "Priority is required!",
      });
      return;
    }
    if (
      req.body.desireToDo > 10 ||
      req.body.desireToDo <= 0 ||
      req.body.desireToDo === null ||
      req.body.desireToDo === undefined
    ) {
      res.status(400).json({
        message: "Desire to do is required!",
      });
      return;
    }
    if (
      req.body.avodiance > 10 ||
      req.body.avodiance <= 0 ||
      req.body.avodiance === null ||
      req.body.avodiance === undefined
    ) {
      res.status(400).json({
        message: "Avodiance is required!",
      });
      return;
    }
    if (
      req.body.startHour === null ||
      req.body.startHour === undefined ||
      req.body.startHour < 0 ||
      req.body.startHour > 23 ||
      req.body.endHour === null ||
      req.body.endHour === undefined ||
      req.body.endHour < 0 ||
      req.body.endHour > 23 ||
      req.body.estimatedHour === null ||
      req.body.estimatedHour === undefined ||
      req.body.estimatedHour < 0 ||
      req.body.estimatedHour > 23 ||
      req.body.startMinute === null ||
      req.body.startMinute === undefined ||
      req.body.startMinute < 0 ||
      req.body.startMinute > 59 ||
      req.body.endMinute === null ||
      req.body.endMinute === undefined ||
      req.body.endMinute < 0 ||
      req.body.endMinute > 59 ||
      req.body.estimatedMinute === null ||
      req.body.estimatedMinute === undefined ||
      req.body.estimatedMinute < 0 ||
      req.body.estimatedMinute > 59
    ) {
      res.status(400).json({
        message: "Please check hour/minute values!",
      });
      return;
    }
    let startHourinMilliSecond = req.body.startHour * 3600000;
    let endHourinMilliSecond = req.body.endHour * 3600000;
    let startMininMilliSecond = req.body.startMinute * 60000;
    let endMininMilliSecond = req.body.endMinute * 60000;
    let editedToDo = await ToDo.findOne({ _id: req.body.id });
    if (editedToDo.userId.toString() !== req.userData.userId) {
      res.status(401).json({
        message: "Different ID!",
      });
      return;
    }
    let endTimeDate = new Date(req.body.endTime);
    let startTimeDate = new Date(req.body.startTime);
    if (
      startTimeDate.setHours(0, 0, 0, 0) +
        startHourinMilliSecond +
        startMininMilliSecond >=
      endTimeDate.setHours(0, 0, 0, 0) +
        endHourinMilliSecond +
        endMininMilliSecond
    ) {
      res.status(400).json({
        message: "Start date cannot be grater than or equal to end time!",
      });
      return;
    }
    if (
      req.body.estimatedTime <= 0 &&
      req.body.estimatedHour <= 0 &&
      req.body.estimatedMinute <= 0
    ) {
      res.status(400).json({
        message: "Estimated time must be greater than 0!",
      });
      return;
    }
    if (
      endTimeDate.setHours(0, 0, 0, 0) +
        endHourinMilliSecond +
        endMininMilliSecond <
      req.body.today
    ) {
      res.status(400).json({
        message: "End time cannot be smaller than or equal to now!",
      });
      return;
    }
    let CBL = [];
    req.body.checkBoxList.map((c) => {
      if (!c.deleted) {
        const data = {
          value: c.value,
          content: c.content,
        };
        CBL.push(data);
      }
    });
    let CBLSet = new Set(CBL.map((item) => item.content));
    if (CBLSet.size !== CBL.length) {
      res.status(404).json({
        message: "Checkbox item content must be unique!",
      });
      return;
    }
    if (CBL.length === 0) {
      await ToDo.updateOne(
        { _id: req.body.id },
        {
          title: req.body.title,
          description: req.body.description,
          checkList: CBL,
          startTime: new Date(
            startTimeDate.setHours(0, 0, 0, 0) +
              startHourinMilliSecond +
              startMininMilliSecond
          ).toString(),
          endTime: new Date(
            endTimeDate.setHours(0, 0, 0, 0) +
              endHourinMilliSecond +
              endMininMilliSecond
          ).toString(),
          workTime: req.body.estimatedTime,
          workHour: req.body.estimatedHour,
          workMinute: req.body.estimatedMinute,
          progress: req.body.progress,
          priority: req.body.priority,
          desireToDo: req.body.desireToDo,
          avodiance: req.body.avodiance,
        }
      );
    } else {
      await ToDo.updateOne(
        { _id: req.body.id },
        {
          title: req.body.title,
          description: req.body.description,
          checkList: CBL,
          startTime: new Date(
            startTimeDate.setHours(0, 0, 0, 0) +
              startHourinMilliSecond +
              startMininMilliSecond
          ).toString(),
          endTime: new Date(
            endTimeDate.setHours(0, 0, 0, 0) +
              endHourinMilliSecond +
              endMininMilliSecond
          ).toString(),
          workTime: req.body.estimatedTime,
          workHour: req.body.estimatedHour,
          workMinute: req.body.estimatedMinute,
          priority: req.body.priority,
          desireToDo: req.body.desireToDo,
          avodiance: req.body.avodiance,
        }
      );
    }
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.GetToDo = async (req, res, next) => {
  try {
    //verileri kontrol etme
    if (
      req.params.width === 0 ||
      req.params.width === null ||
      req.params.width === undefined
    ) {
      res.status(400).json({
        message: "Invalid width value!",
        todos: [],
      });
      return;
    }
    if (
      req.params.height === 0 ||
      req.params.height === null ||
      req.params.height === undefined
    ) {
      res.status(400).json({
        message: "Invalid height value!",
        todos: [],
      });
      return;
    }
    if (req.params.today === null || req.params.today === undefined) {
      res.status(400).json({
        message: "Invalid",
        todos: [],
      });
      return;
    }
    //width ve height rectangular packing alg içinde kullanılacak
    let width = req.params.width;
    let height = req.params.height;
    let today = parseInt(req.params.today);
    let kullanici = await User.findOne({ _id: req.userData.userId });
    let todos = await ToDo.find({ userId: req.userData.userId });
    //todoları filtreleme sonrasında da progress ve kalan zaman durumuna göre waitingleri ayırma
    todos = todos.filter((todo) => todo.status === "waiting");
    let todosFiltered = [];
    todos.forEach(async (todo) => {
      if (todo.checkList.length === 0) {
        if (todo.progress === 100) {
          todosFiltered.push({
            ...todo._doc,
            status: "finished",
          });
          await ToDo.findOneAndUpdate(
            { _id: todo._id },
            {
              status: "finished",
            }
          );
        } else {
          todosFiltered.push(todo);
        }
      } else {
        let total = todo.checkList.length;
        let ticked = 0;
        todo.checkList.forEach((check) => {
          if (check.value) {
            ticked++;
          }
        });
        let progress = 100 * ticked;
        progress = progress / total;
        if (progress === 100) {
          todosFiltered.push({
            ...todo._doc,
            status: "finished",
            progress: progress,
          });
          await ToDo.findOneAndUpdate(
            { _id: todo._id },
            {
              status: "finished",
              progress: progress,
            }
          );
        } else {
          todosFiltered.push({
            ...todo._doc,
            progress: progress,
          });
          await ToDo.findOneAndUpdate(
            { _id: todo._id },
            {
              progress: progress,
            }
          );
        }
      }
    });
    todosFiltered = todosFiltered.filter((todo) => todo.status === "waiting");
    let todosFilteredFinal = [];
    todosFiltered.forEach(async (todo) => {
      if (today >= new Date(todo.endTime).getTime()) {
        todosFilteredFinal.push({
          ...todo._doc,
          status: "outdated",
        });
        await ToDo.findOneAndUpdate(
          { _id: todo._id },
          {
            status: "outdated",
          }
        );
      } else {
        todosFilteredFinal.push(todo);
      }
    });
    todosFilteredFinal = todosFilteredFinal.filter(
      (todo) => todo.status === "waiting"
    );
    let result = [];
    //her todonun önemini hesaplama
    todosFilteredFinal.forEach((todo) => {
      let remainingTime = 0;
      if (today >= new Date(todo.startTime).getTime()) {
        remainingTime = new Date(todo.endTime).getTime() - today;
      } else {
        remainingTime =
          new Date(todo.endTime).getTime() - new Date(todo.startTime).getTime();
      }
      remainingTime = remainingTime / 60000;
      if (remainingTime >= 525949) remainingTime = 525949;
      let workTime =
        todo.workTime * 24 * 60 + todo.workHour * 60 + todo.workMinute;
      if (workTime >= 525949) workTime = 525949;
      let f = workTime * ((100 - todo.progress) / 100);
      f = f / remainingTime;
      f = Math.log10(f);
      if (f < -1) f = -1;
      else if (f > 1) f = 1;
      f += 1;
      f = f * 5;
      //utility değeri
      let value = todo.priority + todo.desireToDo - todo.avodiance;
      value += 8;
      value = value / 3;
      value += 1;
      if (value >= 10) value = 10;
      if (value <= 1) value = 1;
      let sensitiveToDelay = kullanici.procrastination;
      let g = sensitiveToDelay / value;
      //katsayılı totalPoint
      let totalPoint = 4 * f + 2 * g + 4 * todo.priority;
      //let totalPoint = f + g + todo.priority;

      if (today < new Date(todo.startTime).getTime()) {
        let x = new Date(todo.startTime).getTime() - today;
        x = x / 60000;
        x = Math.log10(x);
        if (x > 1) totalPoint = totalPoint / x;
      }

      result.push({
        id: todo._id,
        userId: todo.userId,
        title: todo.title,
        description: todo.description,
        checkBoxList: todo.checkList,
        startTime: todo.startTime,
        endTime: todo.endTime,
        progress: todo.progress,
        priority: todo.priority,
        desireToDo: todo.desireToDo,
        avodiance: todo.avodiance,
        totalPoint: totalPoint,
        f: f,
        g: g,
        o: todo.priority,
        positionX: 0,
        positionY: 0,
        width: 0,
        height: 0,
        area: totalPoint,
        color: "blue",
        rt: remainingTime,
        wt: workTime,
      });
    });
    result.sort((a, b) => {
      return b.totalPoint - a.totalPoint;
    });
    calculateAreas(parseInt(width), parseInt(height), result);
    dummyList = [...result];
    treeMap(parseInt(width), parseInt(height), 0, 0, dummyList, 999, 998, 0);
    res.status(200).json({
      message: "OK",
      todos: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      todos: [],
    });
  }
};

exports.GetOutdatedTodos = async (req, res, next) => {
  try {
    const outdatedTodos = await ToDo.find({
      userId: req.userData.userId,
      status: "outdated",
    });
    let outdatedTodosFinal = [];
    outdatedTodos.forEach((t) => {
      let todo = {
        id: t._id,
        title: t.title,
      };
      outdatedTodosFinal.push(todo);
    });
    res.status(200).json({
      message: "OK",
      todos: outdatedTodosFinal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      todos: [],
    });
  }
};

exports.GetFinishedTodos = async (req, res, next) => {
  try {
    const finishedTodos = await ToDo.find({
      userId: req.userData.userId,
      status: "finished",
    });
    let finishedTodosFinal = [];
    finishedTodos.forEach((t) => {
      let todo = {
        id: t._id,
        title: t.title,
      };
      finishedTodosFinal.push(todo);
    });
    res.status(200).json({
      message: "OK",
      todos: finishedTodosFinal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      todos: [],
    });
  }
};

exports.GetOneToDo = async (req, res, next) => {
  try {
    if (
      req.params.id === null ||
      req.params.id === undefined ||
      req.params.id === ""
    ) {
      res.status(400).json({
        message: "Invalid id!",
        todo: null,
      });
      return;
    }
    let toDoVar = await ToDo.findOne({ _id: req.params.id });
    if (!toDoVar) {
      res.status(400).json({
        message: "Invalid id!",
        todo: null,
      });
      return;
    }
    if (toDoVar.userId.toString() !== req.userData.userId) {
      res.status(401).json({
        message: "Different ID!",
        todo: null,
      });
      return;
    }
    let startHourPlusMinutes = new Date(toDoVar.startTime).getTime() % 86400000;
    startHourPlusMinutes = startHourPlusMinutes / 60000;
    let startMinutes = startHourPlusMinutes % 60;
    let startHour = (startHourPlusMinutes - startMinutes) / 60;
    let endHourPlusMinutes = new Date(toDoVar.endTime).getTime() % 86400000;
    endHourPlusMinutes = endHourPlusMinutes / 60000;
    let endMinutes = endHourPlusMinutes % 60;
    let endHour = (endHourPlusMinutes - endMinutes) / 60;
    startHour += 3;
    if (startHour >= 24) startHour -= 24;
    endHour += 3;
    if (endHour >= 24) endHour -= 24;
    res.status(200).json({
      message: "Success!",
      todo: {
        id: toDoVar._id,
        userId: toDoVar.userId,
        title: toDoVar.title,
        description: toDoVar.description,
        checkBoxList: toDoVar.checkList,
        startTime: toDoVar.startTime,
        startHour: startHour,
        startMinute: startMinutes,
        endTime: toDoVar.endTime,
        endHour: endHour,
        endMinute: endMinutes,
        estimatedTime: toDoVar.workTime,
        workHour: toDoVar.workHour,
        workMinute: toDoVar.workMinute,
        progress: toDoVar.progress,
        priority: toDoVar.priority,
        desireToDo: toDoVar.desireToDo,
        avodiance: toDoVar.avodiance,
        status: toDoVar.status,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      todo: null,
    });
  }
};

exports.UpdateProgress = async (req, res, next) => {
  try {
    if (
      req.body.content === "" ||
      req.body.content === undefined ||
      req.body.content === null
    ) {
      res.status(400).json({
        message: "Content is required!",
        progress: null,
      });
      return;
    }
    if (
      req.body.val === "" ||
      req.body.val === undefined ||
      req.body.val === null
    ) {
      res.status(400).json({
        message: "Value is required!",
        progress: null,
      });
      return;
    }
    if (
      req.body.id === "" ||
      req.body.id === undefined ||
      req.body.id === null
    ) {
      res.status(400).json({
        message: "ID is required!",
        progress: null,
      });
      return;
    }
    let toDo = await ToDo.findOne({ _id: req.body.id });
    if (toDo) {
      if (toDo.userId.toString() !== req.userData.userId) {
        res.status(401).json({
          message: "Different ID!",
          progress: null,
        });
        return;
      }
      let liste = toDo.checkList;
      liste = liste.map((checkbox) => {
        if (req.body.content === checkbox.content) {
          return {
            value: req.body.val,
            content: checkbox.content,
            _id: new ObjectID(checkbox.id),
          };
        } else {
          return checkbox;
        }
      });
      let progress = 0;
      let checkedCount = 0;
      let allCount = 0;
      liste.forEach((checkbox) => {
        allCount++;
        if (checkbox.value) {
          checkedCount++;
        }
      });
      progress = (100 * checkedCount) / allCount;
      if (progress === 100) {
        await ToDo.updateOne(
          { _id: req.body.id },
          { checkList: liste, progress: progress, status: "finished" }
        );
      } else {
        await ToDo.updateOne(
          { _id: req.body.id },
          { checkList: liste, progress: progress, status: "waiting" }
        );
      }
      res.status(200).json({
        message: "Success!",
        progress: progress,
      });
    } else {
      res.status(400).json({
        message: "There is no todo with this id!",
        progress: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      progress: null,
    });
  }
};

exports.DeleteToDo = async (req, res, next) => {
  try {
    if (
      req.params.id === null ||
      req.params.id === undefined ||
      req.params.id === ""
    ) {
      res.status(400).json({
        message: "Invalid id!",
      });
      return;
    }

    let toDo = await ToDo.findOne({ _id: req.params.id });
    if (toDo) {
      if (toDo.userId.toString() !== req.userData.userId) {
        res.status(401).json({
          message: "Different ID!",
        });
        return;
      }
      await ToDo.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Delete operation is success!",
      });
      return;
    } else {
      res.status(400).json({
        message: "Invalid id!",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.GetUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userData.userId });
    if (user) {
      res.status(200).json({
        user: {
          username: user.username,
          email: user.email,
          age: user.age,
          distractibility: user.distractibility,
          impulsiveness: user.impulsiveness,
          lackOfSelfControl: user.lackOfSelfControl,
        },
        message: "OK!",
      });
    } else {
      res.status(400).json({
        user: null,
        message: "There is no user with this id!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      user: null,
      message: "Error!",
    });
  }
};

exports.UpdateProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userData.userId });
    if (user) {
      if (req.body.username === null || req.body.username === undefined) {
        res.status(400).json({
          message: "Username is required!",
        });
        return;
      } else if (req.body.username.length < 6) {
        res.status(400).json({
          message: "Minimum username length is 6!",
        });
        return;
      }
      const users = await User.find({ username: req.body.username });
      if (user.username !== req.body.username && users.length > 0) {
        res.status(400).json({
          message: req.body.username + " is already in use!",
        });
        return;
      }
      if (req.body.age === null || req.body.age === undefined) {
        res.status(400).json({
          message: "Age is required!",
        });
        return;
      } else if (req.body.age < 1 || req.body.age > 120) {
        res.status(400).json({
          message: "Age must be between 1 and 120!",
        });
        return;
      }
      let dist = req.body.distractibility;
      let imp = req.body.impulsiveness;
      let lack = req.body.lackOfSelfControl;
      if (
        dist === null ||
        dist === undefined ||
        imp === null ||
        imp === undefined ||
        lack === null ||
        lack === undefined
      ) {
        res.status(400).json({
          message: "Invalid!",
        });
        return;
      }
      if (dist < 1) dist = 1;
      else if (dist > 10) dist = 10;
      if (imp < 1) imp = 1;
      else if (imp > 10) imp = 10;
      if (lack < 1) lack = 1;
      else if (lack > 10) lack = 10;
      let age = req.body.age;
      age -= 1;
      age = age / 13.22;
      age = age + 1;
      if (age > 10) {
        age = 10;
      }
      //makaleden aldığımız katsayılar age için -.48 distract için .45 impul için .41 losc için .58
      let proc = age * -0.48 + dist * 0.45 + imp * 0.41 + lack * 0.58;
      proc = proc + 3.36;
      proc = proc / 1.92;
      proc += 1;
      if (proc > 10) {
        proc = 10;
      }
      await User.updateOne(
        { _id: req.userData.userId },
        {
          username: req.body.username,
          age: req.body.age,
          distractibility: dist,
          impulsiveness: imp,
          lackOfSelfControl: lack,
          procrastination: proc,
        }
      );
      res.status(200).json({
        message: "OK!",
      });
    } else {
      res.status(400).json({
        message: "There is no user with this id!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};

exports.ChangePassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userData.userId });
    if (user) {
      if (
        req.body.password === null ||
        req.body.password === undefined ||
        req.body.password === ""
      ) {
        res.status(400).json({
          message: "Please check entered password!",
        });
        return;
      } else if (req.body.password.length < 6) {
        res.status(400).json({
          message: "Minimum password length is 6!",
        });
        return;
      }
      const pass = await bcrypt.hash(req.body.password, 10);
      await User.updateOne(
        { _id: req.userData.userId },
        {
          password: pass,
        }
      );
      res.status(200).json({
        message: "OK!",
      });
    } else {
      res.status(400).json({
        message: "There is no user with this id!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error!",
    });
  }
};
