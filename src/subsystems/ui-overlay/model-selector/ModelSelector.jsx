// ModelSelector.jsx
import React, { useState, useEffect } from 'react';
import { useModelSettings } from './ModelSettingsContext';
import { generateModelThumbnail } from './generateModelThumbnail';
import './ModelSelector.css'; // Optional: split CSS too

const MODEL_KEYS = ['ceiling', 'wall', 'floor', 'doorway'];

const ModelSelector = ({ onRegenerate }) => {
    const [models, setModels] = useState({});
    const [thumbnails, setThumbnails] = useState({});
    const { handleModelChange } = useModelSettings();

    useEffect(() => {
        const stored = {};
        const thumbs = {};

        MODEL_KEYS.forEach((key) => {
            localStorage.removeItem(`customThumb-${key}`);
            const url = localStorage.getItem(`customModel-${key}`);
            if (url) stored[key] = url;
        });

        setModels(stored);
        setThumbnails(thumbs);
    }, []);

    const handleFile = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        const thumbnail = await generateModelThumbnail(file);

        localStorage.setItem(`customModel-${key}`, url);
        localStorage.setItem(`customThumb-${key}`, thumbnail);

        setModels((prev) => ({ ...prev, [key]: url }));
        setThumbnails((prev) => ({ ...prev, [key]: thumbnail }));
        handleModelChange(key, url);
    };

    const resetModel = (key) => {
        localStorage.removeItem(`customModel-${key}`);
        localStorage.removeItem(`customThumb-${key}`);
        setModels((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        setThumbnails((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        handleModelChange(key, null);
    };

    return (
        <div className="model-selector">
            <div className="overlay-header">
                <h3>MODEL MANAGER</h3>
                {/* <button className="regenerate-button" onClick={onRegenerate}>
                    REGENERATE MUSEUM
                </button> */}
            </div>

            <div className="model-list">
                {MODEL_KEYS.map((key) => (
                    <div key={key} className="model-item">
                        <div className="model-preview">
                            {thumbnails[key] ? (
                                <img src={thumbnails[key]} alt={`${key} preview`} />
                            ) : (
                                <div className="placeholder-thumb">
                                    <span>NO MODEL</span>
                                </div>
                            )}
                        </div>

                        <div className="model-controls">
                            <label className="file-upload">
                                <input type="file" accept=".glb" onChange={(e) => handleFile(e, key)} />
                                <span>UPLOAD {key.toUpperCase()}</span>
                            </label>

                            {models[key] && (
                                <button className="reset-button" onClick={() => resetModel(key)}>
                                    RESET
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModelSelector;
