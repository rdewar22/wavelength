const Chat = require('../model/Chat');
const Message = require('../model/Message');
const User = require('../model/User');
const mongoose = require('mongoose');


const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId || !req.userId) {
        // console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.userId,
        message: content,
        chat: chatId
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "username, profilePicUri");
        message = await message.populate({
            path: "chat",
            populate: {
                path: "users",
                select: "username profilePicUri"
            }
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        res.json(message);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

}

const deleteChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        
        // Delete all messages in the chat
        await Message.deleteMany({ chat: chatId });
        
        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting chat", error: error.message });
    }
};


const getMessagesInChat = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "username profilePicUri")
            .populate("chat");

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

}

const accessChat = async (req, res) => {
    const { userIds, groupName } = req.body;

    if (!userIds) {
        // console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    try {
        // Parse userIds if it's a JSON string
        const targetUserIds = userIds;



        // Convert all IDs to ObjectId and validate format
        const userIdObjects = targetUserIds.map(id => {
            try {
                // console.log(typeof id);
                return new mongoose.Types.ObjectId(id);
            } catch (err) {
                throw new Error(`Invalid user ID format: ${id}`);
            }
        });

        // Verify all users exist in database
        const existingUsers = await User.find({
            _id: { $in: userIdObjects }
        }).select('_id');

        // Check if all users were found
        if (existingUsers.length !== userIdObjects.length) {
            const foundIds = existingUsers.map(user => user._id.toString());
            const missingIds = userIdObjects.filter(id => !foundIds.includes(id.toString()));
            return res.status(404).json({
                message: "Some users not found",
                missingUsers: missingIds
            });
        }

        // Current user ID (assuming it's already validated by auth middleware)
        const currentUserId = req.userId;

        // Group chat logic
        if (userIdObjects.length > 1) {
            const existingGroup = await Chat.findOne({
                isGroupChat: true,
                users: {
                    $all: [currentUserId, ...userIdObjects],
                    $size: userIdObjects.length + 1
                }
            }).populate("users", "-password")
                .populate("latestMessage");

            if (existingGroup) {
                return res.json(existingGroup);
            }

            const chatData = {
                chatName: groupName || `Group ${Date.now()}`,
                isGroupChat: true,
                users: [currentUserId, ...userIdObjects],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users", "-password");

            return res.status(201).json(fullChat);
        }
        // 1:1 chat logic
        else {
            const existingChat = await Chat.findOne({
                isGroupChat: false,
                users: {
                    $all: [currentUserId, userIdObjects[0]],
                    $size: 2
                }
            }).populate("users", "-password");

            if (existingChat) {
                return res.json(existingChat);
            }

            const chatData = {
                isGroupChat: false,
                users: [currentUserId, userIdObjects[0]],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users", "-password");

            return res.status(201).json(fullChat);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message.includes('ObjectId')
                ? 'Invalid user ID format'
                : 'Server error',
            error: error.message
        });
    }

};

const fetchChatsForUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        Chat.find({ users: { $elemMatch: { $eq: userId } } })
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
    deleteChat,
    accessChat,
    fetchChatsForUserId,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    getMessagesInChat
}