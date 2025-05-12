const Chat = require('../model/Chat');
const Message = require('../model/Message');
const User = require('../model/User')

const sendMessage = async (req, res) => {
    const { to, from, message } = req.body;
    if (!to || !from || !message) return res.status(400).json({ 'message': 'sender, recipient, and content are required' });

    try {
        const result = await Message.create({
            "to": to,
            "from": from,
            "message": message,
        });

        res.status(201).json({ 'success': 'Message sent!' });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }

}


const getMessagesForUserName = async (req, res) => {
    if (!req.params?.username) return res.status(400).json({ "message": 'username required' });

    const username = req.params.username;

    const messages = await Message.find({
        $or: [
            { from: username },
            { to: username }
        ]
    }).sort({ updatedAt: -1 });

    res.json({
        messages: messages
    });
}

const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isgroupchat: false,
        $and: [
            { users: req.user },
            { users: userId }
        ]
    }).populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "username profilePicUri",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate({
                path: "users",
                select: "username profilePicUri"
            });

            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

};

const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.body.userId } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "username profilePicUri",
                });

                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
}

const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill out all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat")
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password");

        res.status(200).json(fullGroupChat)


    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
}

const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        { new: true }
    )
        .populate("users", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
}

const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        { new: true }
    )
        .populate("users", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
}



module.exports = {
    sendMessage,
    getMessagesForUserName,
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
}