import RoomTracker from "./room-tracker/RoomTracker";
import { useSettings } from "./SettingsContext";

function UIOverlay({ roomData }) {

  const { settings } = useSettings();

  return (
    <>
      {/* Other overlays... */}
      <RoomTracker roomData={roomData} currentRoomIndex={settings.currentRoomIndex}/>
    </>
  );
}

export default UIOverlay;
