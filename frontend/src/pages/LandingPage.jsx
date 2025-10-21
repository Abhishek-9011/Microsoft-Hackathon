import React from "react";
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
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrainingLossChart = ({ lossData }) => {
  const data = {
    labels: lossData.map((_, i) => `Epoch ${i + 1}`),
    datasets: [
      {
        label: "Validation Loss",
        data: lossData,
        borderColor: "rgb(37, 99, 235)",
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

const LandingPage = () => {
  const dummyMetrics = {
    mAP_50: 0.685,
    precision: 0.81,
    recall: 0.77,
    inferenceSpeed_ms: 42,
  };

  const dummyLossHistory = [
    0.85, 0.72, 0.61, 0.55, 0.48, 0.41, 0.35, 0.31, 0.28, 0.26,
  ];
  const navigate = useNavigate();
 const dummyConfusionMatrix = [
  [
    "Class",
    "GT: OxygenTank",
    "GT: NitrogenTank",
    "GT: FirstAidBox",
    "GT: FireAlarm",
    "GT: SafetySwitchPanel",
    "GT: EmergencyPhone",
    "GT: FireExtinguisher",
    "GT: Background",
  ],
  ["Pred: OxygenTank", 1026, 8, 1, 2, 0, 0, 0, 87],
  ["Pred: NitrogenTank", 21, 906, 6, 0, 0, 24, 0, 78],
  ["Pred: FirstAidBox", 2, 0, 448, 1, 0, 0, 4, 15],
  ["Pred: FireAlarm", 0, 1, 157, 1, 0, 0, 0, 10],
  ["Pred: SafetySwitchPanel", 0, 0, 0, 0, 226, 0, 0, 17],
  ["Pred: EmergencyPhone", 0, 2, 7, 0, 0, 226, 3, 10],
  ["Pred: FireExtinguisher", 1, 9, 4, 0, 0, 0, 293, 36],
  ["Pred: Background", 489, 609, 319, 165, 218, 199, 351, 0],
];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-[775px] object-cover opacity-70"
        src="/stars.mp4"
      ></video>

      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

      <nav className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 lg:p-8 ">
        <div className="flex items-center space-x-2">
          {/* Logo/Text */}
          <span className="text-xl sm:text-2xl font-bold text-blue-400">
            Cosmic AI

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

      <header
        id="home"
        className="relative z-10 flex flex-col items-center justify-center pt-10 sm:pt-20 pb-40 text-center px-4 min-h-[calc(100vh-10rem)]"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-extrabold mb-4 tracking-wide relative max-w-full">
          Cosmic AI

          
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-300">
          Explore the infinite.
        </p>

        <img
          src="/astronaut.png"
          alt="Astronaut"
          className="absolute z-[-1] w-24 sm:w-32 md:w-44 lg:w-56 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-75 transition-all duration-500 ease-out"
        />

        <Button
          onClick={() => {
            navigate("/upload");
          }}
          className="relative z-10 flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-full text-base sm:text-xl font-semibold hover:bg-gray-200 transition-colors duration-300 shadow-xl"
        >
          <>
            Start Detecting
            <svg
              className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </>
        </Button>
      </header>

      <div
        className="absolute top-90 sm:bottom-[-50px] md:bottom-[-100px] left-1/2 transform -translate-x-1/2 max-w-none 
                    w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[550px] lg:w-[900px] lg:h-[600px] 
                    bg-no-repeat bg-center bg-contain z-0 transition-all duration-500 ease-out"
        style={{ backgroundImage: "url(/earth.png)" }}
      ></div>

      <section className="relative mt-[80px]  z-10 py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        {" "}
        <div className=" mt-10 container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
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

<section
  id="how-it-works"
  className="relative z-10 py-10 px-4 bg-gray-900/50"
>
  <div className="container mx-auto max-w-6xl">
    <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
      How It Works
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Step 1: Upload Image */}
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
              d="M3 16l4-4 4 4m0 0l4-4 4 4m-8 0v6"
            ></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-center mb-3">
          1. Upload the Image
        </h3>
        <p className="text-gray-400 text-center">
          Start by uploading an image. Our system captures and prepares it for
          AI-based analysis.
        </p>
      </div>

      {/* Step 2: Object Detection */}
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
              d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M19 13a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-center mb-3">
          2. AI Detection
        </h3>
        <p className="text-gray-400 text-center">
          The backend processes the image using our trained YOLO model to detect
          and classify all visible objects accurately.
        </p>
      </div>

      {/* Step 3: AI Insights */}
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
              d="M12 8c.132 0 .263.007.393.02a4.002 4.002 0 017.607 1.48A5.002 5.002 0 0117 19H7a5 5 0 01-.001-10c.13 0 .26.007.389.02A4.002 4.002 0 0112 8z"
            ></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-center mb-3">
          3. Get Smart Insights
        </h3>
        <p className="text-gray-400 text-center">
          Two advanced analyses follow — size estimation of detected objects and
          detailed use-case explanation powered by Gemini AI.
        </p>
      </div>
    </div>
  </div>
</section>


      <section
        id="performance-metrics"
        className="relative z-10 py-20 px-4 bg-gray-900/50"
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Model Performance & Analysis 🚀
          </h2>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 text-center">
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-blue-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-blue-400 mb-2">
                78.1%
              </p>
              <p className="text-gray-300 text-lg">mAP@0.5 Score</p>
              <p className="text-xs text-gray-500 mt-1">
              </p>
            </div>
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-green-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-green-400 mb-2">
                88%
              </p>
              <p className="text-gray-300 text-lg">Precision</p>
              <p className="text-xs text-gray-500 mt-1">
                (What percentage of positive predictions are correct.)
              </p>
            </div>
            <div className="p-6 bg-gray-900/70 rounded-xl border-t-4 border-yellow-500 shadow-2xl">
              <p className="text-5xl font-extrabold text-yellow-400 mb-2">
                70%
              </p>
              <p className="text-gray-300 text-lg">Recall</p>
              <p className="text-xs text-gray-500 mt-1">
                (What percentage of objects were correctly detected.)
              </p>
            </div>
            
          </div>

          {/* Graphs and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
            {/* Training Loss Graph */}


            {/* Confusion Matrix */}
            <div className="p-6 bg-gray-900/70 rounded-xl shadow-2xl">
              <ConfusionMatrixTable matrixData={dummyConfusionMatrix} />
            </div>
          </div>
        </div>
      </section>

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

      <footer className="relative z-20 bg-gray-900/50 pt-16 pb-12 px-4 border-t border-blue-600/30 shadow-[0_-5px_20px_rgba(37,99,235,0.2)]">
        <div className="container mx-auto max-w-6xl text-gray-400">
          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 border-b border-gray-700/50 pb-10 mb-8">
            {/* Brand/Mission Statement (Takes up more space on desktop) */}
            <div className="col-span-2 md:col-span-2">
              <h4 className="text-4xl font-extrabold text-blue-400 mb-3 tracking-widest">
                CosmicAi
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
              &copy; {new Date().getFullYear()} CosmicAi. All cosmic rights
              reserved. Developed with passion for the infinite.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
