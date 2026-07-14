import React from "react";
import Navbar from "./components/Navbar.jsx";
import PageFlipBook from "./components/Book.jsx";

export default function Book() {
  return (
    <div className="hp-site min-h-screen overflow-visible bg-black">
      <Navbar />
      <div className="overflow-visible pt-24">
        <PageFlipBook />
      </div>
    </div>
  );
}
