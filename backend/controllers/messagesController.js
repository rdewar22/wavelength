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
            chatname: "sender",
            isgroupchat: false,
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



module.exports = {
    sendMessage,
    getMessagesForUserName,
    accessChat,
    fetchChats
}