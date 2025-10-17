import React, { useState } from "react";

export default function ObjectDetection() {
  const [file, setFile] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResultImg(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://127.0.0.1:5001/detect", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Detection failed.");

      const blob = await res.blob();
      setResultImg(URL.createObjectURL(blob));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to detect objects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Object Detection Demo (YOLOv8)
      </h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Detecting..." : "Upload & Detect"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {resultImg && (
        <div className="mt-4 max-w-full">
          <img
            src={resultImg}
            alt="Detected result"
            className="rounded-lg shadow-lg w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
