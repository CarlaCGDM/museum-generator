import './RoomTracker.css';
import { useSettings } from '../SettingsContext';
import { useMemo } from 'react';
import { Home } from 'lucide-react';

function RoomTracker({ roomData }) {
    const { settings } = useSettings();
    const visited = settings.visitedRooms ?? {};

    const rooms = useMemo(() => {
        return roomData.map((room, index) => ({
            id: room.id,
            name: room.name || `Room ${index}`,
            visited: !!visited[room.id],
            index,
        }));
    }, [roomData, visited]);

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
                            className={`room-tracker-circle ${room.visited ? 'visited' : ''
                                } ${idx === 0 ? 'home' : ''}`}
                        >
                            {idx === 0 ? <Home size={30} strokeWidth={2} /> : room.index}
                        </div>
                        <div className="room-tracker-tooltip">{room.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomTracker;
