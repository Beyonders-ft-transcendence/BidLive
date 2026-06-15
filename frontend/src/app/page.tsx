"use client";
import Header from "@/components/layout/Header";
import Hero from "@/components/layout/home/Hero";
import AboutSection from "@/components/layout/home/About";
import HowItWorksSection from "@/components/layout/home/HowItWorksSection";
import LiveAuctionsSection from "@/components/layout/home/LiveAuctionsSection";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main>
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Hero />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AboutSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <HowItWorksSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <LiveAuctionsSection />
      </motion.div>

      <Footer />
    </main>
  );
}