const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});



async function databaseCalls(){
  
    const userSchema = new mongoose.Schema({
        username: String,
        password: String,     
    })

    const user = mongoose.model ("user", userSchema);

    const taskSchema = new mongoose.Schema({
        _id: Number,
        name: String, 
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        done: Boolean, 
        cleared: Boolean,
    })

    const task = mongoose.model("task", taskSchema);
}

databaseCalls();

module.exports = mongoose.model(user, userSchema, user);
module.exports = mongoose.model(task, taskSchema, task);