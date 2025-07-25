import { useAddReactionMutation } from '../../components/postsApiSlice'

const reactionEmoji = {
    thumbsUp: '👍',
    thumbsDown: '👎'
}


const ReactionButtons = ({ post }) => {
    const [addReaction] = useAddReactionMutation()

    const ReactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
        return (
            <button
                key={name}
                type="button"
                className="reaction-button"
                onClick={() => {
                    const newValue = post.reactions[name] + 1;
                    addReaction({ postId: post._id, reactions: { ...post.reactions, [name]: newValue } })
                }

                }
            >
                {emoji} {post?.reactions[name]}
            </button>
        )
    })

    return <div>{ReactionButtons}</div>

}

export default ReactionButtons
