import React from 'react';

const AudioFilePlayer = ({ audioFile, onRemove, formatFileSize }) => {
    return (
        <div className="selected-file-preview">
            <button
                className="remove-file-btn"
                onClick={onRemove}
                title="Remove audio"
                type="button"
            >
                ×
            </button>
            <div className="selected-file-info">
                <div className="file-icon">
                    🎵
                </div>
                <div className="file-details">
                    <div className="file-name">{audioFile.name}</div>
                    <div className="file-size">{formatFileSize(audioFile.size)}</div>
                </div>
            </div>
            <div className="audio-preview">
                <audio controls>
                    <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    );
};

export default AudioFilePlayer;
