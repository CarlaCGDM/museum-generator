import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateMuseumDataFromCSV } from '../utils/generateMuseumDataFromCSV';
import { computeRoomSizes } from '../utils/computeRoomSizes';
import { generateRoomLayout } from '../utils/generate-room/generateRoomLayout';

const MuseumContext = createContext();

export const MuseumProvider = ({ children }) => {
    const [rawData, setRawData] = useState(null);
    const [roomData, setRoomData] = useState([]);
    const [roomPositions, setRoomPositions] = useState([]);
    const [doorLinks, setDoorLinks] = useState([]);
    const [roomDoorInfo, setRoomDoorInfo] = useState({});
    const [maxPropHeights, setMaxPropHeights] = useState({});
    const [layoutTrigger, setLayoutTrigger] = useState(0);

    const regenerateMuseum = useCallback(async () => {
        const data = await generateMuseumDataFromCSV(
            '/data/csv/artifacts.csv',
            '/data/csv/groups.csv',
            '/data/csv/rooms.csv',
            '/data/csv/topics.csv'
        );
        setRawData(data);

        const report = await computeRoomSizes(data);
        setRoomData(report);

        const roomDefs = report.map(room => ({
            width: room.dimensions.width,
            depth: room.dimensions.depth,
        }));

        const layout = generateRoomLayout(roomDefs, 1);

        const positions = layout.roomPositions;
        const doors = layout.doorLinks;
        setRoomPositions(positions);
        setDoorLinks(doors);

        const roomDoorInfo = {};
        for (let i = 0; i < positions.length; i++) {
            const entranceTiles = doors[i - 1]?.doors?.to || [];
            const exitTiles = doors[i]?.doors?.from || [];
            const allDoorTiles = [...entranceTiles, ...exitTiles];

            const roomCenter = {
                x: positions[i].x + report[i].dimensions.width / 2,
                z: positions[i].z + report[i].dimensions.depth / 2,
            };

            const mid = (tiles) =>
                tiles.length === 0
                    ? { x: roomCenter.x, z: roomCenter.z }
                    : tiles[Math.floor(tiles.length / 2)];

            const entranceMid = mid(entranceTiles);
            const exitMid = mid(exitTiles);

            const rotationTo = (from, to) => Math.atan2(to.x - from.x, -(to.z - from.z));

            roomDoorInfo[i] = {
                entranceTiles,
                exitTiles,
                allDoorTiles,
                entranceMid,
                exitMid,
                entranceRotation: rotationTo(roomCenter, entranceMid),
                exitRotation: rotationTo(roomCenter, exitMid),
            };
        }

        setRoomDoorInfo(roomDoorInfo);

        const maxHeights = {};
        for (const room of report) {
            maxHeights[room.id] = Math.max(...room.artifacts.map(a => a.dimensions.height ?? 0));
        }
        setMaxPropHeights(maxHeights);
    }, []);

    useEffect(() => {
        regenerateMuseum();
    }, [layoutTrigger]);

    const forceRegenerate = () => setLayoutTrigger(prev => prev + 1);

    return (
        <MuseumContext.Provider
            value={{
                rawData,
                roomData,
                roomPositions,
                doorLinks,
                roomDoorInfo,
                maxPropHeights,
                regenerateMuseum: forceRegenerate,
            }}
        >
            {children}
        </MuseumContext.Provider>
    );
};

export const useMuseum = () => useContext(MuseumContext);
