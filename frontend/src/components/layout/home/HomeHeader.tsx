"use client";

import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import Navbar from "./Navbar";
import type { AuctionCategory } from "@/types/auction.types";

interface HomeHeaderProps {
  categoriesData?: AuctionCategory[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmitSearch: (e: React.FormEvent) => void;
  setPage: (page: number) => void;
}

export default function HomeHeader({
  categoriesData,
  selectedCategoryId,
  setSelectedCategoryId,
  searchQuery,
  setSearchQuery,
  onSubmitSearch,
  setPage
}: HomeHeaderProps) {
  return (
    <>
      <TopBar />
      <MainHeader 
        categoriesData={categoriesData}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmitSearch={onSubmitSearch}
        setPage={setPage}
      />
      <Navbar />
    </>
  );
}
