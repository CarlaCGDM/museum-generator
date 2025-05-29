import RoomTracker from "./room-tracker/RoomTracker";
function UIOverlay({ roomData }) {
  return (
    <>
      {/* Other overlays... */}
      <RoomTracker roomData={roomData} />
    </>
  );
}

export default UIOverlay;
