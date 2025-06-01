import './RoomTracker.css';
import { useSettings } from '../SettingsContext';
import { useMemo } from 'react';
import { Home } from 'lucide-react';

function RoomTracker({ roomData }) {
    //console.log(roomData[0].topicName)
    const { settings } = useSettings();
    const visited = settings.visitedRooms ?? {};

    const rooms = useMemo(() => {
        return roomData.map((room, index) => ({
            id: room.id,
            name: room.name || `Room ${index}`,
            visited: !!visited[room.id],
            topicId: room.topicId,
            topicName: room.topicName,
            index,
        }));
    }, [roomData, visited]);

    const topicColors = [
        '#6bff95', // green
        '#a6ff6b', // lime
        '#ffd66b', // yellow
        '#ffb46b', // orange
        '#ff6b6b', // red
        '#ffa8b6', // pink
        '#d96bff', // purple
        '#6b6bff', // indigo
        '#6bc5ff', // blue
        '#6bffff', // cyan
    ];

    function getTopicColor(topicId) {
        // Extract the numeric part from "topic-X" format
        const numericId = parseInt(topicId.split('-')[1]) || 0;
        return topicColors[numericId % topicColors.length];
    }

    return (
        <div className="room-tracker-wrapper">
            <div className="room-tracker-track">
                {rooms.slice(0, -1).map((room, idx) => {
                    const visitedBoth = room.visited && rooms[idx + 1].visited;
                    return (
                        <div
                            key={`segment-${idx}`}
                            className={`room-tracker-segment ${visitedBoth ? 'visited' : ''}`}
                        />
                    );
                })}
            </div>
            <div className="room-tracker-container">
                {rooms.map((room, idx) => (
                    <div key={room.id} className="room-tracker-circle-wrapper">
                        <div
                            className={`room-tracker-circle ${room.visited ? 'visited' : ''} ${idx === 0 ? 'home' : ''}`}
                        >
                            <span className="room-number">{idx === 0 ? <Home size={30} strokeWidth={2} /> : room.index}</span>
                            <div
                                className={`topic-color-inner-circle ${room.visited ? 'visited' : 'unvisited'}`}
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