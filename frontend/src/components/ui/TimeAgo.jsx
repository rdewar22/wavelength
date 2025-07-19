import { parseISO, formatDistanceToNow } from 'date-fns';


const TimeAgo = ({ created, lastEdited }) => {
    let timeAgo = ''
    if (created) {
        const date = parseISO(created)
        const editedDate = parseISO(lastEdited)
        const timePeriod = formatDistanceToNow(date)
        const editPeriod = formatDistanceToNow(editedDate)
        timeAgo = `posted ${timePeriod} ago. last interacted with ${editPeriod} ago.`
    }

    return (
        <span style={{ color: 'black' }} title={created}>
            <i>{timeAgo}</i>
        </span>
    )
}

export default TimeAgo