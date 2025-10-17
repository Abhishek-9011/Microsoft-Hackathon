from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import os
import uuid
import json
from datetime import datetime
from collections import Counter

app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")

os.makedirs("static", exist_ok=True)

def generate_detection_description(detections):
    """Generate a human-readable description of detected objects"""
    if not detections:
        return "No objects detected in the image."
    
    object_counts = Counter([det["class"] for det in detections])
    
    parts = []
    for obj_class, count in object_counts.items():
        if count == 1:
            parts.append(f"a {obj_class}")
        else:
            parts.append(f"{count} {obj_class}s")
    
    if len(parts) == 1:
        description = f"The image contains {parts[0]}."
    elif len(parts) == 2:
        description = f"The image contains {parts[0]} and {parts[1]}."
    else:
        description = f"The image contains {', '.join(parts[:-1])}, and {parts[-1]}."
    
    high_confidence_detections = [det for det in detections if det["confidence"] > 0.7]
    if high_confidence_detections:
        main_objects = Counter([det["class"] for det in high_confidence_detections])
        if main_objects:
            main_items = []
            for obj, count in main_objects.items():
                if count == 1:
                    main_items.append(obj)
                else:
                    main_items.append(f"{count} {obj}s")
            
            if len(main_items) > 0:
                description += f" The most confident detections include {', '.join(main_items)}."
    
    return description

def get_detailed_detection_info(detections):
    """Get detailed information about each detection"""
    if not detections:
        return "No objects were detected with sufficient confidence."
    
    class_info = {}
    for detection in detections:
        cls = detection["class"]
        if cls not in class_info:
            class_info[cls] = {
                "count": 0,
                "confidences": [],
                "average_confidence": 0
            }
        class_info[cls]["count"] += 1
        class_info[cls]["confidences"].append(detection["confidence"])
    
    for cls in class_info:
        confidences = class_info[cls]["confidences"]
        class_info[cls]["average_confidence"] = round(sum(confidences) / len(confidences), 2)
    
    details = f"Detected {len(detections)} objects across {len(class_info)} different classes:\n\n"
    
    for cls, info in sorted(class_info.items(), key=lambda x: x[1]["count"], reverse=True):
        count = info["count"]
        avg_conf = info["average_confidence"]
        details += f"• {count} {cls}(s) with {avg_conf*100}% average confidence\n"
    
    return details

@app.route("/detect", methods=["POST"])
def detect_objects():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files["image"]
        
        if not file.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400

        image = Image.open(file.stream).convert("RGB")
        
        results = model.predict(image, imgsz=1024, conf=0.25)
        
        filename = f"detected_{uuid.uuid4().hex}.jpg"
        output_path = os.path.join("static", filename)
        
        results[0].save(filename=output_path)
        
        detection_data = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                detection_data.append({
                    "class": model.names[cls],
                    "confidence": round(conf, 2),
                    "class_id": cls
                })
        
        simple_description = generate_detection_description(detection_data)
        detailed_description = get_detailed_detection_info(detection_data)
        
        response_data = {
            "image_url": f"/static/{filename}",
            "detections": detection_data,
            "summary": {
                "total_objects": len(detection_data),
                "unique_classes": len(set([d["class"] for d in detection_data])),
                "description": simple_description,
                "detailed_analysis": detailed_description
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

@app.route("/static/<filename>")
def serve_image(filename):
    """Serve processed images"""
    try:
        return send_file(os.path.join("static", filename), mimetype="image/jpeg")
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model": "YOLOv8n",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("Starting YOLO Object Detection Server...")
    print("Make sure to install required packages: pip install ultralytics pillow flask flask-cors")
    app.run(host="0.0.0.0", port=5001, debug=True)