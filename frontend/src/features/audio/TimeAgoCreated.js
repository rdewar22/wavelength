import { parseISO, formatDistanceToNow } from 'date-fns';


const TimeAgoCreated = ({ created }) => {
    let timeAgo = ''
    if (created) {
        const date = parseISO(created)
        const timePeriod = formatDistanceToNow(date)
        timeAgo = `posted ${timePeriod} ago.`
    }

    return (
        <span style={{ color: 'black' }} title={created}>
            &nbsp; <i>{timeAgo}</i>
        </span>
    )
}

export default TimeAgoCreated