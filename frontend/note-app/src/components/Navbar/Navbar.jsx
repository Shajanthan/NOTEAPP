import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-navBg flex items-center justify-between px-6 py-2 drop-shadow text-white">
      <h2 className="text-xl font-medium py-2">Notes</h2>

      <ProfileInfo
        userInfo={userInfo}
        onLogout={onLogout}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
    </div>
  );
};

export default Navbar;
