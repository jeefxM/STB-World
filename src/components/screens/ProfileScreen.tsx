"use client";

import React from "react";
import { Profile } from "@/components/profile";

const ProfileScreen: React.FC = () => {
  return (
    <div className="flex flex-col min-h-full bg-game">
      <Profile />
    </div>
  );
};

export default ProfileScreen;
