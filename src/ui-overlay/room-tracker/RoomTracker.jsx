import './RoomTracker.css';
import { useSettings } from '../SettingsContext';
import { useMemo, useRef } from 'react';
import { Home } from 'lucide-react';

function RoomTracker({ roomData }) {
    const { settings } = useSettings();
    const visited = settings.visitedRooms ?? {};

    // Persistent per-room progress store
    const showcaseProgressRef = useRef({});

    const rooms = useMemo(() => {
        return roomData.map((room, index) => {
            const key = room.id;

            // Initialize once per room
            if (!showcaseProgressRef.current[key]) {
                const totalShowcasesInRoom = Math.floor(Math.random() * 10) + 3;
                 const clickedShowcasesInRoom = Math.floor(Math.random() * totalShowcasesInRoom); // Random progress

                showcaseProgressRef.current[key] = {
                    totalShowcasesInRoom,
                    clickedShowcasesInRoom,
                };
            }

            const {
                totalShowcasesInRoom,
                clickedShowcasesInRoom,
            } = showcaseProgressRef.current[key];

            const progress = clickedShowcasesInRoom / totalShowcasesInRoom;

            return {
                id: room.id,
                name: room.name || `Room ${index}`,
                topicId: room.topicId,
                topicName: room.topicName,
                index,
                progress,
            };
        });
    }, [roomData]); // ⬅️ Don't depend on visited here or it'll rerun

    const topicColors = [
        '#9EC9C2', '#DE9393', '#A7C585', '#A7C585',
        '#D0BF6A', '#B295CB', '#E4B77F', '#C0C57C',
        '#C691C4', '#89B5B1',
    ];

    function getTopicColor(topicId) {
        const numericId = parseInt(topicId?.split('-')[1]) || 0;
        return topicColors[numericId % topicColors.length];
    }

    return (
        <div className="room-tracker-wrapper">
            <div className="room-tracker-track">
                {rooms.slice(0, -1).map((_, idx) => (
                    <div
                        key={`segment-${idx}`}
                        className="room-tracker-segment"
                    />
                ))}
            </div>
            <div className="room-tracker-container">
                {rooms.map((room, idx) => (
                    <div key={room.id} className="room-tracker-circle-wrapper">
                        <div className={`room-tracker-circle ${idx === 0 ? 'home' : ''}`}>
                            <svg className="progress-ring" viewBox="0 0 36 36">
                                <path
                                    className="progress-ring-track"
                                    d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="4"
                                />
                                <path
                                    className="progress-ring-fill"
                                    d="M18 1 a 17 17 0 1 1 0 34 a 17 17 0 1 1 0 -34"
                                    fill="none"
                                    stroke={getTopicColor(room.topicId)}
                                    strokeWidth="2"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - room.progress * 100}
                                    style={{ opacity: visited[room.id] ? 1 : 0.3 }}
                                />
                            </svg>

                            <span className="room-number">
                                {idx === 0 ? <Home size={30} strokeWidth={2} /> : room.index}
                            </span>

                            <div
                                className={`topic-color-inner-circle ${
                                    visited[room.id] ? 'visited' : 'unvisited'
                                }`}
                                style={{ backgroundColor: getTopicColor(room.topicId) }}
                            />
                        </div>

                        <div className="room-tracker-tooltip">
                            <div className="tooltip-topic">{room.topicName}</div>
                            <div className="tooltip-room">{room.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomTracker;

