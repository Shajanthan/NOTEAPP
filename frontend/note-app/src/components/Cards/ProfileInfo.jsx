import React, { useState } from "react";
import { getInitials } from "../../helper";
import SearchBar from "../SearchBar/SearchBar";

const ProfileInfo = ({
  userInfo,
  onLogout,
  onSearchNote,
  handleClearSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    userInfo && (
      <>
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => {
            setSearchQuery(target.value);
          }}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-50">
            {getInitials(userInfo?.name)}
          </div>
          <div>
            <p className="text-sm font-medium">{userInfo?.name}</p>
            <button className="text-sm underline" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </>
    )
  );
};

export default ProfileInfo;
