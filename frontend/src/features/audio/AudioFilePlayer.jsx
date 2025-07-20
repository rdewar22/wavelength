import React from 'react';

const AudioFilePlayer = ({ audioFile, audioTitle, onRemove, formatFileSize, audioAuthorId }) => {
    // Determine if we have a file or just a title
    const hasFile = audioFile && audioFile instanceof File;
    const displayTitle = hasFile ? audioFile.name : audioTitle;
    const displaySize = hasFile ? formatFileSize(audioFile.size) : null;

    const audioUrl = audioFile ? URL.createObjectURL(audioFile) : "https://robby-wavelength-test.s3.us-east-2.amazonaws.com/audio-files/" + audioAuthorId + "/" + audioTitle;
    const audioType = "audio/mpeg";

    return (
        <div className="selected-file-preview">
            {hasFile && <button
                className="remove-file-btn"
                onClick={onRemove}
                title="Remove audio"
                type="button"
            >
                ×
            </button>}
            <div className="selected-file-info">
                <div className="file-icon">
                    🎵
                </div>
                <div className="file-details">
                    <div className="file-name">{displayTitle}</div>
                    {hasFile && displaySize && <div className="file-size">{displaySize}</div>}
                </div>
            </div>

            <div className="audio-preview">
                <audio controls>
                    <source src={audioUrl} type={audioType} />
                    Your browser does not support the audio element.
                </audio>
            </div>

        </div>
    );
};

export default AudioFilePlayer;
