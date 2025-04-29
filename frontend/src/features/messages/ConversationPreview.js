const { useSelector } = require("react-redux")
const { selectMessageById } = require("./messagesApiSlice")

const ConversationPreview = ({ messageId }) => {
    const conversation = useSelector(state => selectMessageById(state, messageId))

    return (
        <button>
            <p>{conversation}</p>
        </button>
    )
}

export default ConversationPreview