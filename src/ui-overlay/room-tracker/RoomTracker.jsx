import './RoomTracker.css';
import { useSettings } from '../SettingsContext';
import { useMemo, useRef } from 'react';
import { Home, Triangle } from 'lucide-react';


function RoomTracker({ roomData, currentRoomIndex }) {
    const { settings } = useSettings();
    const visited = settings.visitedRooms ?? {};

    // Persistent per-room progress store
    const showcaseProgressRef = useRef({});

    const rooms = useMemo(() => {
        return roomData.map((room, index) => {
            const key = room.id;

            if (!showcaseProgressRef.current[key]) {
                const totalShowcasesInRoom = Math.floor(Math.random() * 10) + 3;
                const clickedShowcasesInRoom = Math.floor(Math.random() * totalShowcasesInRoom);
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
                clickedShowcasesInRoom,
                totalShowcasesInRoom,
                progress,
            };
        });
    }, [roomData]);

    const topicColors = [
        '#DE9393', '#DC997C', '#ECBF87', '#D0BF6A',
        '#C0C57C', '#A7C585', '#87C7AD', '#76B8BD',
        '#8C9ACA', '#B295CB', '#C691C4'
    ];

    function getTopicColor(topicId) {
        const numericId = parseInt(topicId?.split('-')[1]) || 0;
        return topicColors[numericId % topicColors.length];
    }

    // Dynamic sizing based on room count
    const baseCircleVW = roomData.length <= 10 ? 3 : Math.max(2, 30 / roomData.length);
    const baseGapVW = baseCircleVW * 0.6; // 60% of circle size
    const circleSizePx = `${baseCircleVW}vw`;
    const gapSize = `${baseGapVW}vw`;

    return (
        <div className="room-tracker-wrapper">
            <div
                className="room-tracker-container"
                style={{
                    '--tracker-gap': gapSize,
                    '--circle-size': circleSizePx
                }}

            >
                {rooms.map((room, idx) => (
                    <div
                        key={room.id}
                        className="room-tracker-circle-wrapper"
                        style={{ width: circleSizePx }}
                    >
                        <div
                            className="room-tracker-circle"
                            style={{ width: circleSizePx, height: circleSizePx }}
                        >
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
                                {idx === 0 ? <Home size={20} strokeWidth={2} /> : room.index}
                            </span>

                            <div
                                className={`topic-color-inner-circle ${visited[room.id] ? 'visited' : 'unvisited'
                                    }`}
                                style={{ backgroundColor: getTopicColor(room.topicId) }}
                            />
                        </div>

                        {currentRoomIndex === idx && (
                            <div
                                className="triangle-indicator"
                                style={{ '--triangle-color': getTopicColor(room.topicId) }}
                            />
                        )}

                        <div className="room-tracker-tooltip">
                            <div className="tooltip-topic">{room.topicName}</div>
                            <div className="tooltip-room">
                                {room.name} ({room.clickedShowcasesInRoom}/{room.totalShowcasesInRoom})
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomTracker;
