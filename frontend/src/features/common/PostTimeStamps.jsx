import { parseISO } from 'date-fns';

const PostTimeStamps = ({ created, lastEdited }) => {
    const date = new Date(created);
    const parts = new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    }).formatToParts(date);
    
    const getValue = type => parts.find(part => part.type === type).value;
    const createdDate = `created: ${getValue('month')} ${getValue('day')}, ${getValue('year')} at ${getValue('hour')}:${getValue('minute')} ${getValue('dayPeriod')}`;
    

    const edited = new Date(lastEdited);
    const editedParts = new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    }).formatToParts(edited);
    
    const getEditedValue = type => editedParts.find(part => part.type === type).value;
    const editedDate = `last interacted with: ${getEditedValue('month')} ${getEditedValue('day')}, ${getEditedValue('year')} at ${getEditedValue('hour')}:${getEditedValue('minute')} ${getEditedValue('dayPeriod')}`;
    

         return (
         <span style={{ color: 'white' }}>
             <i>{createdDate}</i>
             <br />
             <i>{editedDate}</i>
         </span>
     );
}

export default PostTimeStamps;