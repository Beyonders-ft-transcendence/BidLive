"use client";

import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import Navbar from "./Navbar";
import type { AuctionCategory } from "@/types/auction.types";

interface HomeHeaderProps {
  categoriesData?: AuctionCategory[];
  selectedCategoryId?: number | null;
  setSelectedCategoryId?: (id: number | null) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSubmitSearch?: (e: React.FormEvent) => void;
  setPage?: (page: number) => void;
}

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeHeader({
  categoriesData,
  selectedCategoryId: externalCategoryId,
  setSelectedCategoryId: externalSetCategoryId,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  onSubmitSearch: externalOnSubmit,
  setPage
}: HomeHeaderProps) {
  const router = useRouter();
  const [localCategory, setLocalCategory] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState("");

  const selectedCategoryId = externalCategoryId !== undefined ? externalCategoryId : localCategory;
  const setSelectedCategoryId = externalSetCategoryId || setLocalCategory;
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearch;
  const setSearchQuery = externalSetSearchQuery || setLocalSearch;

  const onSubmitSearch = externalOnSubmit || ((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategoryId) params.set("category", String(selectedCategoryId));
    router.push(`/explore?${params.toString()}`);
  });
  return (
    <>
      <TopBar />
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <MainHeader 
          categoriesData={categoriesData}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmitSearch={onSubmitSearch}
          setPage={setPage || (() => {})}
        />
        <Navbar />
      </div>
    </>
  );
}
