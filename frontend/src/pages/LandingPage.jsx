import React from "react";
// 1. IMPORT CHART LIBRARIES
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ImageUploadDialog from "./ImageUploadDialog";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ====================================================================
// COMPONENT 1: Training Loss Chart (for line graph)
// This should be in a separate file in a real project, but is included here for integration.
// ====================================================================
const TrainingLossChart = ({ lossData }) => {
  const data = {
    // Labels representing Epochs
    labels: lossData.map((_, i) => `Epoch ${i + 1}`),
    datasets: [
      {
        label: "Validation Loss",
        data: lossData,
        borderColor: "rgb(37, 99, 235)", // Blue-600
        backgroundColor: "rgba(37, 99, 235, 0.4)",
        tension: 0.3,
        pointBackgroundColor: "rgb(255, 255, 255)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "white" } },
      title: {
        display: true,
        text: "Model Training Loss Over Epochs",
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "gray" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Loss Value", color: "white" },
        ticks: { color: "gray" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return <Line options={options} data={data} />;
};

// ====================================================================
// COMPONENT 2: Confusion Matrix Table
// ====================================================================
const ConfusionMatrixTable = ({ matrixData }) => {
  if (!matrixData || matrixData.length === 0) return <div>No matrix data.</div>;

  const header = matrixData[0];
  const dataRows = matrixData.slice(1);

  return (
    <div className="overflow-x-auto">
      <h4 className="text-2xl font-semibold mb-4 text-white">
        Confusion Matrix (@0.5 IoU)
      </h4>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-blue-900/50 text-xs sm:text-sm">
            {header.map((col, i) => (
              <th
                key={i}
                className="p-2 border border-gray-700 font-bold text-blue-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="text-center text-sm">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="p-2 border border-gray-700"
                  // Highlight correct classifications (diagonal)
                  style={{
                    backgroundColor:
                      cellIndex === rowIndex + 1
                        ? "rgba(37, 99, 235, 0.2)"
                        : "rgba(37, 99, 235, 0.05)",
                    color: cellIndex === rowIndex + 1 ? "#93c5fd" : "white", // Light Blue for numbers
                  }}
                >
                  {cellIndex === 0 ? (
                    <span className="font-semibold text-blue-300">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-400">
        Rows = **Predicted** Class. Columns = **Ground Truth** (Actual) Class.
      </p>
    </div>
  );
};

// ====================================================================
// MAIN LANDING PAGE COMPONENT
// ====================================================================
const LandingPage = () => {
  // 2. DUMMY DATA FOR GRAPHS AND METRICS
  const dummyMetrics = {
    mAP_50: 0.685,
    precision: 0.81,
    recall: 0.77,
    inferenceSpeed_ms: 42,
  };

  const dummyLossHistory = [
    0.85, 0.72, 0.61, 0.55, 0.48, 0.41, 0.35, 0.31, 0.28, 0.26,
  ];

  // Dummy Confusion Matrix data for 5 classes (OxygenTank, FireExtinguisher, FirstAidBox, FireAlarm, SafetySwitchPanel)
  const dummyConfusionMatrix = [
    [
      "Class",
      "GT: OxygenTank",
      "GT: FireExtinguisher",
      "GT: FirstAidBox",
      "GT: FireAlarm",
      "GT: SafetySwitchPanel",
    ],
    ["Pred: OxygenTank", 145, 2, 0, 0, 0],
    ["Pred: FireExtinguisher", 3, 168, 0, 0, 1],
    ["Pred: FirstAidBox", 1, 0, 160, 0, 0],
    ["Pred: FireAlarm", 0, 0, 0, 155, 0],
    ["Pred: SafetySwitchPanel", 0, 0, 0, 0, 150],
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Background Video (stars.mp4) */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-[775px] object-cover opacity-70"
        src="/stars.mp4"
      ></video>

      {/* Overlay for gradient and stars effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 lg:p-8 ">
        <div className="flex items-center space-x-2">
          {/* Logo/Text */}
          <span className="text-xl sm:text-2xl font-bold text-blue-400">
            Title
          </span>
        </div>

        {/* Desktop Navigation Links (with scroll functionality) */}
        <ul className="hidden lg:flex space-x-6 xl:space-x-8 text-base xl:text-lg">
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#performance-metrics"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("performance-metrics");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Performance Metrics
            </a>
          </li>{" "}
          {/* Updated Link */}
          <li>
            <a
              href="#contact-us"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact-us");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Contact Us
            </a>
          </li>
        </ul>


        {/* Mobile Menu Icon Placeholder */}
        <div className="lg:hidden">
          {/* You would place a mobile menu icon/toggle logic here */}
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* 1. HERO SECTION */}
      {/* ==================================================================== */}
      <header
        id="home"
        className="relative z-10 flex flex-col items-center justify-center pt-10 sm:pt-20 pb-40 text-center px-4 min-h-[calc(100vh-10rem)]"
      >
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold mb-4 tracking-wide relative max-w-full">
          Title
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-300">
          Explore the infinite.
        </p>

        {/* ASTRONAUT IMAGE - CORRECTED RESPONSIVE SIZING */}
        <img
          src="/astronaut.png"
          alt="Astronaut"
          // Corrected non-standard classes (w-25, w-30, etc.) to standard Tailwind utility classes
          className="absolute z-[-1] w-24 sm:w-32 md:w-44 lg:w-56 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-75 transition-all duration-500 ease-out"
        />

        {/* Button - Kept above the astronaut with z-index */}
        <ImageUploadDialog />
      </header>

      {/* Earth Image - ADJUSTED POSITIONING TO BE ON FIRST SCREEN */}
      <div
        className="absolute top-90 sm:bottom-[-50px] md:bottom-[-100px] left-1/2 transform -translate-x-1/2 max-w-none 
                    w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[550px] lg:w-[900px] lg:h-[600px] 
                    bg-no-repeat bg-center bg-contain z-0 transition-all duration-500 ease-out"
        style={{ backgroundImage: "url(/earth.png)" }}
      ></div>

      
      <section className="relative mt-[80px]  z-10 py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        {" "}
        <div className=" mt-10 container mx-auto max-w-4xl text-center">
          <h2  className="text-4xl sm:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            AI-Powered Safety Monitoring for Space
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            Welcome to the Duality AI Space Station Challenge dashboard. This
            application allows you to visualize and analyze the performance of
            an object detection model trained to identify critical safety
            equipment in a simulated space environment. Using a synthetic
            dataset generated by our Falcon digital twin platform, this model
            learns to recognize objects like oxygen tanks and fire extinguishers
            under various conditions. Below, you can see the key performance
            metrics of our model and understand the steps involved in training
            and deploying such an AI for mission-critical applications.
          </p>
        </div>
      </section>
      {/* ==================================================================== */}
      {/* 2. HOW IT WORKS SECTION */}
      {/* ==================================================================== */}
      <section
        id="how-it-works"
        className=" relative z-10 py-10 px-4 bg-gray-900/50 "
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1: Register */}
            <div className="p-8 border border-gray-700 rounded-xl hover:border-blue-500 transition-all duration-300 shadow-xl bg-gray-900/50">
              <div className="text-blue-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0 3.517-1.025 6.802-2.903 9.76a1.001 1.001 0 01-1.632-.303L6 17m3-4a4 4 0 11-8 0 4 4 0 018 0zm-3 0h.01M16 12a4 4 0 100-8 4 4 0 000 8zm0 0h.01M21 21v-7a2 2 0 00-2-2h-3"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-3">
                1. Register for Blastoff
              </h3>
              <p className="text-gray-400 text-center">
                Create your cosmic profile and secure your spot on the mission
                manifest for the event.
              </p>
            </div>

            {/* Step 2: Explore */}
            <div className="p-8 border border-gray-700 rounded-xl hover:border-blue-500 transition-all duration-300 shadow-xl bg-gray-900/50">
              <div className="text-blue-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.832 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.832 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.168 18 16.5 18s-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-3">
                2. Navigate the Cosmos
              </h3>
              <p className="text-gray-400 text-center">
                Browse through all our unique competitive events, workshops, and
                proshow details.
              </p>
            </div>

            {/* Step 3: Participate */}
            <div className="p-8 border border-gray-700 rounded-xl hover:border-blue-500 transition-all duration-300 shadow-xl bg-gray-900/50">
              <div className="text-blue-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-3">
                3. Claim Your Victory
              </h3>
              <p className="text-gray-400 text-center">
                Participate, compete, and experience the best inter-galactic
                festival to secure prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. PERFORMANCE METRICS SECTION (New Section) */}
      {/* ==================================================================== */}
      <section
        id="performance-metrics"
        className="relative z-10 py-20 px-4 bg-gray-900/50"
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Model Performance & Analysis 🚀
          </h2>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 text-center">
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-blue-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-blue-400 mb-2">
                {(dummyMetrics.mAP_50 * 100).toFixed(1)}%
              </p>
              <p className="text-gray-300 text-lg">mAP@0.5 Score</p>
              <p className="text-xs text-gray-500 mt-1">
                (Target: &gt; 40-50%)
              </p>
            </div>
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-green-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-green-400 mb-2">
                {(dummyMetrics.precision * 100).toFixed(1)}%
              </p>
              <p className="text-gray-300 text-lg">Precision</p>
              <p className="text-xs text-gray-500 mt-1">
                (What percentage of positive predictions are correct.)
              </p>
            </div>
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-yellow-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-yellow-400 mb-2">
                {(dummyMetrics.recall * 100).toFixed(1)}%
              </p>
              <p className="text-gray-300 text-lg">Recall</p>
              <p className="text-xs text-gray-500 mt-1">
                (What percentage of objects were correctly detected.)
              </p>
            </div>
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-red-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-red-400 mb-2">
                {dummyMetrics.inferenceSpeed_ms}ms
              </p>
              <p className="text-gray-300 text-lg">Inference Speed</p>
              <p className="text-xs text-gray-500 mt-1">
                (Time to predict per image.)
              </p>
            </div>
          </div>

          {/* Graphs and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
            {/* Training Loss Graph */}
            <div className="p-6 bg-gray-900/70 rounded-xl shadow-2xl h-[400px]">
              <TrainingLossChart lossData={dummyLossHistory} />
            </div>

            {/* Confusion Matrix */}
            <div className="p-6 bg-gray-900/70 rounded-xl shadow-2xl">
              <ConfusionMatrixTable matrixData={dummyConfusionMatrix} />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. CONTACT US SECTION (Moved to 4th section) */}
      {/* ==================================================================== */}
      <section
        id="contact-us"
        className="relative z-10 py-24 px-4 bg-gray-900/50"
      >
        <div className="container mx-auto max-w-4xl bg-gray-900/80 p-8 md:p-12 rounded-2xl shadow-2xl border border-blue-600/50">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 text-white">
            Contact Command
          </h2>
          <p className="text-lg sm:text-xl text-center text-gray-400 mb-10">
            We're ready for transmission. Send us your cosmic query!
          </p>

          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-white shadow-inner"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-white shadow-inner"
            />
            <textarea
              placeholder="Your Message"
              rows="6"
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-white shadow-inner"
            ></textarea>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg shadow-blue-500/50 transform hover:scale-[1.01]"
            >
              Send Transmission
            </button>
          </form>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. FOOTER */}
      {/* ==================================================================== */}
      <footer className="relative z-20 bg-gray-900/50 pt-16 pb-12 px-4 border-t border-blue-600/30 shadow-[0_-5px_20px_rgba(37,99,235,0.2)]">
        <div className="container mx-auto max-w-6xl text-gray-400">
          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 border-b border-gray-700/50 pb-10 mb-8">
            {/* Brand/Mission Statement (Takes up more space on desktop) */}
            <div className="col-span-2 md:col-span-2">
              <h4 className="text-4xl font-extrabold text-blue-400 mb-3 tracking-widest">
                Title
              </h4>
              <p className="text-base text-gray-300 max-w-sm">
                The confluence of innovation and imagination. Join our mission
                to explore the infinite possibilities of technology and culture.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h5 className="text-xl font-bold text-white mb-4">Explore</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("home");
                    }}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Home Base
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("how-it-works");
                    }}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Mission Briefing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Events Portal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Proshow Lineup
                  </a>
                </li>
              </ul>
            </div>

            {/* Support/Contact */}
            <div className="col-span-1">
              <h5 className="text-xl font-semibold text-white mb-4">Support</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#contact-us"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contact-us");
                    }}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Contact Command
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    FAQ Hub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Logistics
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media Links (with Icons) */}
            <div className="col-span-2 md:col-span-1">
              <h5 className="text-xl font-semibold text-white mb-4">Connect</h5>
              <div className="flex space-x-5">
                {/* Instagram Icon */}
                <a
                  href="#"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  title="Instagram"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 4a2 2 0 11-4 0 2 2 0 014 0zm-2.5 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 7 12 7s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm-5.5 0c0-1.33.67-2.67 2-3.33v3.33h-2zm11 0c0-1.33-.67-2.67-2-3.33v3.33h2z" />
                  </svg>
                </a>

                {/* X (Twitter) Icon */}
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="X (Twitter)"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.9 3.1h-14C3.84 3.1 3 3.94 3 4.98v14.04C3 20.06 3.84 21 4.9 21h14.2c1.06 0 1.9-0.94 1.9-1.98V4.98C21 3.94 20.16 3.1 19.1 3.1zM17.48 9.9l-2.72 5.08h-1.6l3.3-6.18h1.02zM7.22 8.71h1.76l4.64 8.52h-1.74l-4.7-8.52zM15.42 16.9H13.6L9.6 9.17h1.83l3.99 7.73z" />
                  </svg>
                </a>

                {/* Discord Icon */}
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="Discord"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.53 17.5l-1.07-1.1c-.81.65-1.8.99-2.91.99-2.88 0-5.21-2.22-5.21-4.94s2.33-4.94 5.21-4.94c1.11 0 2.1.34 2.91.99l1.07-1.1c-.96-.75-2.14-1.2-3.5-1.2-3.92 0-7.1 3.06-7.1 6.84s3.18 6.84 7.1 6.84c1.36 0 2.54-.45 3.5-1.2zm-2.5-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm7-2c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Title. All cosmic rights
              reserved. Developed with passion for the infinite.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
