import { useAddReactionMutation } from '../../components/postsApiSlice'
import './ReactionButtons.css'

const reactionConfig = {
    thumbsUp: {
        icon: '♥',
        activeIcon: '♥',
        color: '#f91880',
        hoverColor: 'rgba(249, 24, 128, 0.1)',
        label: 'Like'
    },
    thumbsDown: {
        icon: 'ｘ',
        activeIcon: 'ｘ',
        color: '#00ba7c',
        hoverColor: 'rgba(0, 186, 124, 0.1)',
        label: 'Repost'
    }
}

const ReactionButtons = ({ post }) => {
    const [addReaction] = useAddReactionMutation()

    const handleReaction = (reactionType) => {
        const newValue = post.reactions[reactionType] + 1;
        addReaction({ 
            postId: post._id, 
            reactions: { ...post.reactions, [reactionType]: newValue } 
        })
    }

    return (
        <div className="reaction-buttons-container">
            {Object.entries(reactionConfig).map(([name, config]) => (
                <button
                    key={name}
                    type="button"
                    className="twitter-reaction-button"
                    style={{
                        '--reaction-color': config.color,
                        '--reaction-hover-bg': config.hoverColor
                    }}
                    onClick={() => handleReaction(name)}
                    aria-label={`${config.label} (${post?.reactions[name]})`}
                >
                    <div className="reaction-icon-wrapper">
                        <span className="reaction-icon">{config.icon}</span>
                    </div>
                    <span className="reaction-count">{post?.reactions[name] || 0}</span>
                </button>
            ))}
        </div>
    )
}

export default ReactionButtons
