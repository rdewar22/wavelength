import { useSelector } from "react-redux"
import { makeSelectMessages } from "./messagesApiSlice"

const MsgPreview = ({ messageId, username }) => {
const { selectById } = makeSelectMessages(username);
  const message = useSelector(state => selectById(state, messageId));
  
  return <button>{message?.to}</button>;
}

export default MsgPreview