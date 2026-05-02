
import DeviceFingerprint from "../Fingerprint/DeviceFingerprint";
import EnhancedDetector from "../location/EnhancedDetector";

const Home = () => {
  return (
    <div>
      <EnhancedDetector />
      <DeviceFingerprint />
    </div>
  );
};

export default Home;
