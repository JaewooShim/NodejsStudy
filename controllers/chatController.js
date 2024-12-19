const Message = require("../models/message");

module.exports = (io) => {
    io.on("connection", client => {
        console.log("new connection");
        
        Message.find({}).sort({ createdAt: -1}).limit(10).then(messages => {
            client.emit("load all messages", messages.reverse());
        });
        
        client.on("disconnect", () => {
            client.broadcast.emit("user disconnected");
            console.log("user disconnected");
        });

        client.on("message", (data) => {
            let messageAttributes = {
                content: data.content,
                userName: data.userName,
                user: data.userId
            };
            let m = new Message(messageAttributes);
            m.save().then(() => {
                io.emit("message", messageAttributes);
            }).catch(error => console.log(error.message));
        });
    });
};

// client.on("message", () => { ... }): This listens for a message event on the client socket.

// The message event is expected to be sent from the client to the server.
// When the server receives a message event from a client, it triggers the provided callback.
// Inside the callback, the server emits a message event to all clients:

// io.emit("message", { content: "hello" }): This broadcasts the message event to all connected clients (i.e., it’s not limited to just the client that sent the message).