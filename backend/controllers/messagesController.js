const Message = require('../model/Message');

const sendMessage = async (req, res) => {
    const { to, from, message } = req.body;
    if (!to || !from || !message) return res.status(400).json({ 'message': 'sender, recipient, and content are required'});

    try {
        const result = await Message.create({
            "to": to,
            "from": from,
            "message": message,
        });

        res.status(201).json({ 'success': 'Message sent!'});
    } catch (err) {
        res.status(500).json({'message': err.message });
    }

}

const getMessagesForUserName = async (req, res) => {
    if (!req.params?.username) return res.status(400).json({ "message": 'username required'});
    
    const username = req.params.username;

    const [messagesSent, messagesReceived] = await Promise.all([
        Message.find({ from: username }),
        Message.find({ to: username })
    ]);
    
    // Get unique users
    const userSet = new Set();
    
    messagesSent.forEach(msg => userSet.add(msg.to));
    messagesReceived.forEach(msg => userSet.add(msg.from));
    
    // Remove the original username if it somehow got added
    userSet.delete(username);
    
    res.json({
        sent: messagesSent,
        received: messagesReceived,
        uniqueUsers: Array.from(userSet)
    });
}

module.exports = {
    sendMessage,
    getMessagesForUserName
}