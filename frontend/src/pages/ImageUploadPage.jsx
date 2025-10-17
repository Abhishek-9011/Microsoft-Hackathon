import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploadDialog from "./ImageUploadDialog";

const ImageUploadPage = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (imageData) => {
    setUploadedImages(prev => [imageData, ...prev]);
  };

  const handleProcessing = (processing) => {
    setIsProcessing(processing);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Description copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-70"
        style={{ backgroundImage: "url('/starImage.png')" }}
      ></div>

      <div className="fixed inset-0 bg-gradient-to-t from-black to-transparent"></div>

      <nav className="relative z-30 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-400">
            Title
          </span>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Cosmic Object Detection
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Upload images to detect objects using advanced AI and get detailed cosmic analysis of what's in your images.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-2xl border border-blue-600/30 bg-gray-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg border-b border-blue-500/50">
              <CardTitle className="flex mt-4 items-center gap-3 text-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
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
                      <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {isProcessing ? 'Analyzing Cosmic Data...' : 'Ready for Upload?'}
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-sm mx-auto">
                    {isProcessing 
                      ? 'AI is scanning for objects and generating cosmic descriptions...' 
                      : 'Click the button below to upload an image for cosmic object detection.'
                    }
                  </p>
                  <div className="flex justify-center items-center">
                   <ImageUploadDialog 
                     onImageUpload={handleImageUpload}
                     onProcessing={handleProcessing}
                   />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
                    <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white">YOLOv8</h4>
                    <p className="text-sm text-gray-300 mt-1">Object Detection</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
                    <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white">AI Analysis</h4>
                    <p className="text-sm text-gray-300 mt-1">Cosmic Description</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
                    <div className="w-10 h-10 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white">Light Speed</h4>
                    <p className="text-sm text-gray-300 mt-1">Instant Results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border border-green-600/30 bg-gray-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg border-b border-green-500/50">
              <CardTitle className="flex mt-4 items-center gap-3 text-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Cosmic Analysis Results
              </CardTitle>
              <CardDescription className="text-green-100">
                View detected objects with cosmic descriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {uploadedImages.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {uploadedImages.map((imageData, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg shadow-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div className="text-center">
                            <h4 className="font-semibold text-white mb-2">Original Image</h4>
                            <img
                              src={imageData.original}
                              alt={`Original ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-600"
                            />
                          </div>
                          
                          <div className="text-center">
                            <h4 className="font-semibold text-white mb-2">Cosmic Detection</h4>
                            <img
                              src={imageData.processed}
                              alt={`Processed ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-600"
                            />
                          </div>
                        </div>
                        
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
                            
                            <TabsContent value="simple" className="space-y-2 mt-4">
                              <div className="flex justify-between items-start">
                                <p className="text-gray-200 text-sm flex-1">
                                  {imageData.description}
                                </p>
                                <button 
                                  onClick={() => copyToClipboard(imageData.description)}
                                  className="ml-2 text-blue-400 hover:text-blue-300 text-xs bg-blue-900/30 px-3 py-2 rounded border border-blue-500/30 hover:border-blue-400 transition-all"
                                  title="Copy to clipboard"
                                >
                                  Copy
                                </button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="detailed" className="space-y-2 mt-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-gray-200 text-sm whitespace-pre-line">
                                    {imageData.detailedAnalysis}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-400">
                                    <p>Total cosmic objects: {imageData.summary.total_objects}</p>
                                    <p>Unique classes detected: {imageData.summary.unique_classes}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => copyToClipboard(imageData.detailedAnalysis)}
                                  className="ml-2 text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-3 py-2 rounded border border-green-500/30 hover:border-green-400 transition-all"
                                  title="Copy to clipboard"
                                >
                                  Copy
                                </button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                        
                        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Analyzed: {imageData.timestamp}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => downloadImage(imageData.processed, `cosmic-detection-${index + 1}.jpg`)}
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
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-green-300 font-medium">
                        {uploadedImages.length} cosmic image(s) analyzed with object detection
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-600">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Awaiting Cosmic Data
                  </h3>
                  <p className="text-gray-300 max-w-sm mx-auto">
                    Upload an image to begin cosmic object detection and AI-generated analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 max-w-none 
                   w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[550px] 
                   bg-no-repeat bg-center bg-contain z-0 opacity-50"
        style={{ backgroundImage: "url(/earth.png)" }}
      ></div>
    </div>
  );
};

export default ImageUploadPage;