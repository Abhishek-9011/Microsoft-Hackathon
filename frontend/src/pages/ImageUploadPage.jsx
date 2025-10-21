  import { useState } from "react";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import ImageUploadDialog from "./ImageUploadDialog";
  import { useNavigate } from "react-router-dom";

  const ImageUploadPage = () => {
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingUseCases, setLoadingUseCases] = useState({});
    const navigate = useNavigate();
    const handleImageUpload = (imageData) => {
      setUploadedImages((prev) => [imageData, ...prev]);
    };

    const handleProcessing = (processing) => {
      setIsProcessing(processing);
    };

    const removeImage = (index) => {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const downloadImage = async (imageUrl, filename) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading image:", error);
        alert("Error downloading image. Please try again.");
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Description copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy text to clipboard.");
        });
    };

    const getUseCases = async (imageIndex, detectionIndex) => {
      const imageData = uploadedImages[imageIndex];
      const detection = imageData.detections[detectionIndex];

      if (!detection) return;

      // Set loading state
      setLoadingUseCases((prev) => ({
        ...prev,
        [`${imageIndex}-${detectionIndex}`]: true,
      }));

      try {
        const response = await fetch(
          "https://microsoft-hackathon-4.onrender.com/get-single-use-case",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              object: detection.class,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch use cases");
        }

        const data = await response.json();

        // Update the detection with the new use case
        const updatedImages = [...uploadedImages];
        updatedImages[imageIndex].detections[detectionIndex] = {
          ...detection,
          uses: data.use_case,
          uses_source: data.source,
        };

        setUploadedImages(updatedImages);
      } catch (error) {
        console.error("Error fetching use cases:", error);
        alert("Failed to fetch use cases. Please try again.");
      } finally {
        // Clear loading state
        setLoadingUseCases((prev) => ({
          ...prev,
          [`${imageIndex}-${detectionIndex}`]: false,
        }));
      }
    };

    const getAllUseCases = async (imageIndex) => {
      const imageData = uploadedImages[imageIndex];
      const objects = imageData.detections.map((det) => det.class);

      if (!objects.length) return;

      // Set loading state for all detections in this image
      const loadingStates = {};
      imageData.detections.forEach((_, detectionIndex) => {
        loadingStates[`${imageIndex}-${detectionIndex}`] = true;
      });
      setLoadingUseCases((prev) => ({ ...prev, ...loadingStates }));

      try {
        const response = await fetch("https://microsoft-hackathon-4.onrender.com/get-use-cases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objects: objects,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch use cases");
        }

        const data = await response.json();

        // Update all detections with their use cases
        const updatedImages = [...uploadedImages];
        updatedImages[imageIndex].detections = updatedImages[
          imageIndex
        ].detections.map((det, detIndex) => ({
          ...det,
          uses: data.use_cases[det.class] || det.uses,
          uses_source: data.source,
        }));

        setUploadedImages(updatedImages);
      } catch (error) {
        console.error("Error fetching use cases:", error);
        alert("Failed to fetch use cases. Please try again.");
      } finally {
        // Clear loading states for all detections in this image
        const clearStates = {};
        imageData.detections.forEach((_, detectionIndex) => {
          clearStates[`${imageIndex}-${detectionIndex}`] = false;
        });
        setLoadingUseCases((prev) => ({ ...prev, ...clearStates }));
      }
    };

    return (
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage: "url('/starImage.png')" }}
        ></div>
        <div className="fixed inset-0 bg-gradient-to-t from-black to-transparent"></div>

        <nav className="relative z-30 flex justify-between items-center p-6 lg:p-8 bg-transparent">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-400 cursor-pointer select-none">
              Cosmic AI
            </span>
            </div>

            <div
              onClick={() => navigate("/")}
              className="flex justify-center items-center text-white text-lg font-medium cursor-pointer hover:text-blue-400 transition-colors duration-200"
            >
              <span>Home Page</span>
            </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
              Cosmic Object Detection
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Upload images to detect objects using advanced AI and get cosmic
              analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Upload Card */}
            <Card className="shadow-2xl border border-blue-600/30 bg-gray-900/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg border-b border-blue-500/50">
                <CardTitle className="flex mt-4 items-center gap-3 text-2xl">
                  Upload Cosmic Image
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Choose from your device or use your camera for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="bg-gray-800/50 rounded-2xl p-8 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-300">
                    <div className="w-24 h-24 mx-auto bg-blue-900/30 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                      ) : (
                        <svg
                          className="w-12 h-12 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {isProcessing
                        ? "Analyzing Cosmic Data..."
                        : "Ready for Upload?"}
                    </h3>
                    <div className="flex justify-center items-center">
                      <ImageUploadDialog
                        onImageUpload={handleImageUpload}
                        onProcessing={handleProcessing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="shadow-2xl border border-green-600/30 bg-gray-900/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg border-b border-green-500/50">
                <CardTitle className="flex mt-4 items-center gap-3 text-2xl">
                  Cosmic Analysis Results
                </CardTitle>
                <CardDescription className="text-green-100">
                  View detected objects with cosmic descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {uploadedImages.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {uploadedImages.map((imageData, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg shadow-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div className="text-center">
                            <h4 className="font-semibold text-white mb-2">
                              Original Image
                            </h4>
                            <img
                              src={imageData.original}
                              alt="Original"
                              className="w-full h-48 object-contain rounded-lg border border-gray-600"
                            />
                          </div>
                          <div className="text-center">
                            <h4 className="font-semibold text-white mb-2">
                              Cosmic Detection
                            </h4>
                            <img
                              src={imageData.processed}
                              alt="Processed"
                              className="w-full h-48 object-contain rounded-lg border border-gray-600"
                            />
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                          <Tabs defaultValue="simple" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-800 p-1 rounded-lg">
                              <TabsTrigger
                                value="simple"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
                              >
                                Cosmic Summary
                              </TabsTrigger>
                              <TabsTrigger
                                value="detailed"
                                className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-all"
                              >
                                Deep Analysis
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent
                              value="simple"
                              className="space-y-2 mt-4"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-gray-200 text-sm flex-1">
                                  {imageData.description}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(imageData.description)
                                  }
                                  className="flex-shrink-0 text-blue-400 hover:text-blue-300 text-xs bg-blue-900/30 px-3 py-2 rounded border border-blue-500/30 hover:border-blue-400 transition-all"
                                >
                                  Copy
                                </button>
                              </div>
                            </TabsContent>

                            <TabsContent
                              value="detailed"
                              className="space-y-2 mt-4"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="text-gray-200 text-sm whitespace-pre-line">
                                    {imageData.detailedAnalysis}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-400">
                                    <p>
                                      Total objects:{" "}
                                      {imageData.summary.total_objects}
                                    </p>
                                    <p>
                                      Unique classes:{" "}
                                      {imageData.summary.unique_classes}
                                    </p>
                                  </div>

                                  {/* Get All Use Cases Button */}
                                  {imageData.detections &&
                                    imageData.detections.length > 0 && (
                                      <div className="mt-3 mb-4">
                                        <button
                                          onClick={() => getAllUseCases(index)}
                                          disabled={Object.values(
                                            loadingUseCases
                                          ).some((state) => state)}
                                          className="text-purple-400 hover:text-purple-300 text-xs font-medium px-3 py-1 bg-purple-900/30 rounded border border-purple-500/30 hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {Object.values(loadingUseCases).some(
                                            (state) => state
                                          )
                                            ? "Loading Use Cases..."
                                            : "Get All Use Cases"}
                                        </button>
                                      </div>
                                    )}

                                  {/* Object Detections */}
                                  {imageData.detections &&
                                    imageData.detections.length > 0 && (
                                      <div className="mt-3 space-y-3">
                                        <p className="text-xs font-semibold text-gray-300">
                                          Detected Objects:
                                        </p>
                                        {imageData.detections.map((det, i) => (
                                          <div
                                            key={i}
                                            className="text-xs text-gray-200 ml-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <strong className="text-blue-300">
                                                  {det.class}
                                                </strong>
                                                <span className="text-gray-400 ml-2">
                                                  — Confidence:{" "}
                                                  {(det.confidence * 100).toFixed(
                                                    1
                                                  )}
                                                  %
                                                </span>
                                                {det.estimated_depth && (
                                                  <span className="text-gray-400 ml-2">
                                                    • Depth:{" "}
                                                    {det.estimated_depth.toFixed(
                                                      2
                                                    )}
                                                  </span>
                                                )}
                                                {det.estimated_width_cm && (
                                                  <span className="text-gray-400 ml-2">
                                                    • Width:{" "}
                                                    {det.estimated_width_cm} cm
                                                  </span>
                                                )}
                                                {det.estimated_height_cm && (
                                                  <span className="text-gray-400 ml-2">
                                                    • Height:{" "}
                                                    {det.estimated_height_cm} cm
                                                  </span>
                                                )}
                                              </div>
                                              <button
                                                onClick={() =>
                                                  getUseCases(index, i)
                                                }
                                                disabled={
                                                  loadingUseCases[`${index}-${i}`]
                                                }
                                                className="flex-shrink-0 text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-2 py-1 rounded border border-green-500/30 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                                              >
                                                {loadingUseCases[`${index}-${i}`]
                                                  ? "..."
                                                  : "Get Uses"}
                                              </button>
                                            </div>

                                            {det.uses && (
                                              <div className="mt-2 pt-2 border-t border-gray-700">
                                                <details className="cursor-pointer">
                                                  <summary className="font-medium text-gray-300 flex items-center">
                                                    <span>Uses</span>
                                                    {det.uses_source ===
                                                      "gemini" && (
                                                      <span className="ml-2 text-xs bg-green-900/50 text-green-300 px-1 rounded">
                                                        AI
                                                      </span>
                                                    )}
                                                  </summary>
                                                  <p className="text-gray-400 mt-1 pl-4 text-xs leading-relaxed">
                                                    {det.uses}
                                                  </p>
                                                </details>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(imageData.detailedAnalysis)
                                  }
                                  className="flex-shrink-0 text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-3 py-2 rounded border border-green-500/30 hover:border-green-400 transition-all"
                                >
                                  Copy
                                </button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-gray-800/30 flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            Analyzed: {imageData.timestamp}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                downloadImage(
                                  imageData.processed,
                                  `cosmic-detection-${index + 1}.jpg`
                                )
                              }
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium px-4 py-2 bg-blue-900/30 rounded-md border border-blue-500/30 hover:border-blue-400 transition-all"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => removeImage(index)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 bg-red-900/30 rounded-md border border-red-500/30 hover:border-red-400 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Awaiting Cosmic Data
                    </h3>
                    <p className="text-gray-300 max-w-sm mx-auto">
                      Upload an image to begin cosmic object detection and AI
                      analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-no-repeat bg-center bg-contain opacity-50"
          style={{ backgroundImage: "url(/earth.png)" }}
        ></div>
      </div>
    );
  };

  export default ImageUploadPage;
