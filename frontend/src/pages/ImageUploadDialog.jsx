import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";

const ImageUploadDialog = ({ onImageUpload, onProcessing }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Camera effect - fixed
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({ url: imageUrl, file: file });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          setSelectedImage({ url: imageUrl, file: file });
          stopCamera(); // Stop camera after capture
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const uploadToBackend = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setIsUploading(true);
      onProcessing(true);

      const response = await fetch('http://localhost:5001/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Fixed: Use the correct image URL construction
      const processedImageUrl = `http://localhost:5001${data.image_url}`;
      
      onImageUpload({
        original: selectedImage.url,
        processed: processedImageUrl,
        description: data.summary?.description || "No description available",
        detailedAnalysis: data.summary?.detailed_analysis || "No detailed analysis available",
        detections: data.detections || [],
        summary: data.summary || { total_objects: 0, unique_classes: 0 },
        timestamp: new Date().toLocaleString()
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error processing image: ${error.message}`);
    } finally {
      setIsUploading(false);
      onProcessing(false);
    }
  };

  const handleFinalUpload = () => {
    if (selectedImage && selectedImage.file) {
      uploadToBackend(selectedImage.file);
      setIsDialogOpen(false);
      setSelectedImage(null);
      if (cameraActive) {
        stopCamera();
      }
    }
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      stopCamera();
      setSelectedImage(null);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="relative z-10 flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-full text-base sm:text-xl font-semibold hover:bg-gray-200 transition-colors duration-300 shadow-xl"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Upload Image
              <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Upload Image
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose how you want to upload your image
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-white">
              Upload from System
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-white">Use Camera</Label>
            
            {!cameraActive ? (
              <Button
                onClick={startCamera}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUploading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Start Camera
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={captureImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isUploading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Capture
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                    disabled={isUploading}
                  >
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="space-y-2">
              <Label className="text-white">Preview</Label>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleFinalUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Upload Image'
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;