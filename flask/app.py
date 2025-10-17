from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import os
import uuid
from datetime import datetime
from collections import Counter
import torch
import google.generativeai as genai
import math
import threading
from concurrent.futures import ThreadPoolExecutor

# ---------- CONFIG ----------
GEMINI_API_KEY = "AIzaSyDu5X0K0hZbc9OmEicZODdngTX9fJGj_-U"
DEPTH_MODEL_NAME = "Intel/dpt-large"
REFERENCE_OBJECT_NAME = "credit_card"
REFERENCE_OBJECT_WIDTH_CM = 8.56
# ----------------------------

app = Flask(__name__)
CORS(app)

# Load YOLO model
model = YOLO("best.pt")
os.makedirs("static", exist_ok=True)

# Configure Gemini API
try:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash-lite')
    GEMINI_AVAILABLE = True
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Gemini API configuration failed: {e}")
    GEMINI_AVAILABLE = False

# Load depth estimation model
try:
    depth_model = torch.hub.load("intel-isl/MiDaS", "DPT_Large")
    depth_model.eval()
    depth_transform = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform
    DEPTH_AVAILABLE = True
    print("✅ Depth model loaded successfully")
except Exception as e:
    print(f"❌ Depth model loading failed: {e}")
    DEPTH_AVAILABLE = False
    depth_model = None
    depth_transform = None

# Thread pool for async Gemini calls
gemini_executor = ThreadPoolExecutor(max_workers=3)

# Known average sizes for common objects (in cm)
KNOWN_OBJECT_SIZES = {
    # Gas Cylinders and Tanks
    "NitrogenTank": {"avg_width": 30.0, "avg_height": 150.0, "type": "cylinder"},
    "OxygenTank": {"avg_width": 25.0, "avg_height": 90.0, "type": "cylinder"},
    "GasCylinder": {"avg_width": 30.0, "avg_height": 120.0, "type": "cylinder"},
    "PropaneTank": {"avg_width": 40.0, "avg_height": 60.0, "type": "cylinder"},
    
    # Fire Safety Equipment
    "FireExtinguisher": {"avg_width": 20.0, "avg_height": 50.0, "type": "cylinder"},
    "FireHydrant": {"avg_width": 40.0, "avg_height": 120.0, "type": "cylinder"},
    "FireAlarm": {"avg_width": 15.0, "avg_height": 15.0, "type": "box"},
    
    # Safety Equipment - ADDED YOUR 7 OBJECTS
    "FirstAidBox": {"avg_width": 30.0, "avg_height": 40.0, "type": "box"},
    "FirstAidKit": {"avg_width": 30.0, "avg_height": 40.0, "type": "box"},
    "SafetyCone": {"avg_width": 30.0, "avg_height": 45.0, "type": "cone"},
    "SafetyVest": {"avg_width": 50.0, "avg_height": 60.0, "type": "cloth"},
    "SafetySwitchPanel": {"avg_width": 50.0, "avg_height": 70.0, "type": "box"},
    "EmergencyPhone": {"avg_width": 20.0, "avg_height": 30.0, "type": "box"},
    
    # Industrial Equipment
    "Compressor": {"avg_width": 60.0, "avg_height": 90.0, "type": "box"},
    "Generator": {"avg_width": 80.0, "avg_height": 60.0, "type": "box"},
    "ToolBox": {"avg_width": 40.0, "avg_height": 25.0, "type": "box"},
    
    # General Objects
    "Person": {"avg_width": 50.0, "avg_height": 170.0, "type": "person"},
    "Vehicle": {"avg_width": 200.0, "avg_height": 150.0, "type": "vehicle"},
    "Computer": {"avg_width": 40.0, "avg_height": 30.0, "type": "box"},
    "CreditCard": {"avg_width": 8.56, "avg_height": 5.4, "type": "card"},
}

# Comprehensive fallback descriptions for your specific objects
FALLBACK_DESCRIPTIONS = {
    # Gas Cylinders and Tanks
    "NitrogenTank": "A pressurized container storing nitrogen gas. Used in various industries for inerting, purging, food packaging, and as a coolant in medical and scientific applications. Nitrogen is an inert gas that prevents oxidation.",
    "OxygenTank": "A pressurized cylinder containing medical-grade oxygen. Essential for patients with respiratory conditions, in hospitals, ambulances, and home healthcare. Also used in aviation, diving, and industrial processes.",
    "GasCylinder": "A pressurized container for storing gases. Used for various industrial, medical, and commercial applications including welding, cooking fuel, medical gases, and chemical processes.",
    "PropaneTank": "A container for liquefied petroleum gas (LPG). Commonly used for heating, cooking, hot water systems, and as fuel for grills, forklifts, and generators.",
    
    # Fire Safety Equipment
    "FireExtinguisher": "A fire safety device used to extinguish or control small fires. Contains extinguishing agents like dry chemical, CO2, or foam. Essential in buildings, vehicles, and industrial settings for emergency fire suppression.",
    "FireHydrant": "A connection point for firefighters to access water supply. Located along streets and in buildings for emergency firefighting operations.",
    "FireAlarm": "A safety device that detects smoke, heat, or fire and alerts occupants through audible and visual signals. Crucial for early fire detection and evacuation.",
    
    # Safety Equipment - ADDED YOUR 7 OBJECTS
    "FirstAidBox": "A container storing medical supplies and equipment for emergency first aid treatment. Contains bandages, antiseptics, gloves, and basic medical tools. Essential in workplaces, schools, and public areas for immediate medical response.",
    "FirstAidKit": "A collection of medical supplies and equipment for providing initial medical treatment. Contains bandages, antiseptics, gloves, and basic medical tools for emergency situations.",
    "SafetyCone": "A cone-shaped marker used for road safety, construction zones, and hazard areas. Provides visual warning to redirect traffic and mark dangerous areas.",
    "SafetyVest": "A high-visibility garment worn to make the wearer more visible. Used by construction workers, emergency personnel, and in low-light conditions for safety.",
    "SafetySwitchPanel": "An electrical control panel with emergency stop buttons and safety switches. Used in industrial settings to quickly shut down machinery during emergencies for operator safety.",
    "EmergencyPhone": "An emergency communication device used for immediate contact with security, medical, or emergency services. Typically found in elevators, parking garages, campuses, and industrial facilities for emergency situations.",
    
    # General Objects
    "Person": "A human being engaged in various activities. Can be working, operating equipment, or performing tasks depending on the context.",
    "Vehicle": "A machine used for transportation of people or goods. Includes cars, trucks, forklifts, and other mobile equipment.",
    "Computer": "An electronic device for data processing and communication. Used for monitoring, control systems, data analysis, and operational management.",
    "CreditCard": "A payment card issued by financial institutions. Standard size is 8.56 cm × 5.4 cm. Used for electronic payments and identification.",
}

# Store for Gemini responses
gemini_cache = {}

# ---------------- UTILITIES ----------------
def generate_detection_description(detections):
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
    
    high_conf = [det for det in detections if det["confidence"] > 0.7]
    if high_conf:
        main_objects = Counter([det["class"] for det in high_conf])
        main_items = [f"{count} {obj}s" if count > 1 else obj for obj, count in main_objects.items()]
        description += f" The most confident detections include {', '.join(main_items)}."
    
    return description

def get_detailed_detection_info(detections):
    if not detections:
        return "No objects were detected with sufficient confidence."
    
    class_info = {}
    for det in detections:
        cls = det["class"]
        if cls not in class_info:
            class_info[cls] = {"count": 0, "confidences": []}
        class_info[cls]["count"] += 1
        class_info[cls]["confidences"].append(det["confidence"])
    
    details = ""
    for cls, info in class_info.items():
        avg_conf = round(sum(info["confidences"]) / len(info["confidences"]), 2)
        details += f"• {info['count']} {cls}(s) with {avg_conf*100}% average confidence\n"
    
    return details

def estimate_depth(image, bbox):
    """Estimate depth for an object using DPT/MiDaS."""
    if not DEPTH_AVAILABLE:
        return None
        
    try:
        x1, y1, x2, y2 = map(int, bbox)
        cropped = image.crop((x1, y1, x2, y2))
        input_tensor = depth_transform(cropped).unsqueeze(0)
        with torch.no_grad():
            depth_map = depth_model(input_tensor)
            depth_map = torch.nn.functional.interpolate(
                depth_map.unsqueeze(1),
                size=(cropped.height, cropped.width),
                mode="bicubic",
                align_corners=False
            ).squeeze()
            return float(depth_map.mean())
    except Exception as e:
        print(f"Depth estimation error: {e}")
        return None

def estimate_size_using_depth(depth_value, pixel_width, pixel_height, focal_length=1000):
    """
    Estimate real-world size using depth information
    focal_length: approximate focal length in pixels (typical for smartphone cameras)
    """
    if depth_value is None:
        return None, None
    
    try:
        # Convert depth to distance (simplified approach)
        distance = max(0.1, depth_value * 10)  # Simplified conversion
        
        # Calculate real-world size using similar triangles
        # size_real = (size_pixels * distance) / focal_length
        width_cm = (pixel_width * distance) / focal_length * 100  # Convert to cm
        height_cm = (pixel_height * distance) / focal_length * 100  # Convert to cm
        
        return round(width_cm, 2), round(height_cm, 2)
    except:
        return None, None

def estimate_size_using_reference(detections, ref_class, ref_real_width, ref_real_height):
    """
    Estimate sizes using a reference object in the image
    """
    ref_detection = next((det for det in detections if det["class"] == ref_class), None)
    
    if not ref_detection:
        return None, None
    
    try:
        # Get reference object pixel dimensions
        ref_bbox = ref_detection["bbox"]
        ref_pixel_width = ref_bbox[2] - ref_bbox[0]
        ref_pixel_height = ref_bbox[3] - ref_bbox[1]
        
        # Calculate conversion ratios
        width_ratio = ref_real_width / ref_pixel_width
        height_ratio = ref_real_height / ref_pixel_height
        
        return width_ratio, height_ratio
    except:
        return None, None

def estimate_size_using_known_averages(object_class, pixel_width, pixel_height, image_width, image_height):
    """
    Estimate size based on known average object sizes and image composition
    """
    if object_class not in KNOWN_OBJECT_SIZES:
        return None, None
    
    try:
        known_size = KNOWN_OBJECT_SIZES[object_class]
        avg_width = known_size["avg_width"]
        avg_height = known_size["avg_height"]
        
        # Estimate based on typical object proportions in images
        # This is a heuristic approach
        if known_size["type"] == "person":
            # People are typically photographed at certain distances
            estimated_width = avg_width * (pixel_width / 100)  # Heuristic scaling
            estimated_height = avg_height * (pixel_height / 200)  # Heuristic scaling
        elif known_size["type"] == "vehicle":
            estimated_width = avg_width * (pixel_width / 300)
            estimated_height = avg_height * (pixel_height / 200)
        else:
            # For other objects, use simpler scaling
            estimated_width = avg_width * (pixel_width / 150)
            estimated_height = avg_height * (pixel_height / 150)
        
        return round(estimated_width, 2), round(estimated_height, 2)
    except:
        return None, None

def get_object_uses_fallback(object_name):
    """Get immediate object description using fallback"""
    if object_name in FALLBACK_DESCRIPTIONS:
        return FALLBACK_DESCRIPTIONS[object_name]
    else:
        return f"A {object_name} is used in various industrial, safety, or operational contexts depending on the specific application and environment."

def get_gemini_use_cases(object_name):
    """Get enhanced use cases from Gemini API"""
    if not GEMINI_AVAILABLE:
        return get_object_uses_fallback(object_name)
    
    # Check cache first
    cache_key = object_name.lower()
    if cache_key in gemini_cache:
        print(f"✅ Using cached Gemini response for {object_name}")
        return gemini_cache[cache_key]
    
    try:
        prompt = f"""Provide a comprehensive but concise description of a {object_name} focusing on:
1. What it is and its primary function
2. Common industrial or safety use cases
3. Key features and applications
4. Safety considerations if applicable

Keep it under 200 words and focused on practical industrial/safety applications:"""
        
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.8,
            top_k=40,
            max_output_tokens=300,
        )
        
        response = gemini_model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        if response and hasattr(response, 'text') and response.text:
            cleaned_response = response.text.strip()
            # Cache the response
            gemini_cache[cache_key] = cleaned_response
            print(f"✅ Gemini success for {object_name}")
            return cleaned_response
        else:
            raise Exception("Empty response from Gemini")
            
    except Exception as e:
        print(f"❌ Gemini API error for {object_name}: {e}")
        # Return fallback and cache it
        fallback = get_object_uses_fallback(object_name)
        gemini_cache[cache_key] = fallback
        return fallback

def get_batch_gemini_use_cases(object_names):
    """Get use cases for multiple objects at once"""
    results = {}
    for object_name in object_names:
        results[object_name] = get_gemini_use_cases(object_name)
    return results

# ---------------- ROUTES ----------------
@app.route("/detect", methods=["POST"])
def detect_objects():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files["image"]
        image = Image.open(file.stream).convert("RGB")
        image_width, image_height = image.size

        # Perform object detection
        results = model.predict(image, imgsz=1024, conf=0.25)

        # Save annotated image
        filename = f"detected_{uuid.uuid4().hex}.jpg"
        output_path = os.path.join("static", filename)
        results[0].save(filename=output_path)

        detection_data = []
        if results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                bbox = box.xyxy[0].tolist()
                
                # Get object info with basic description
                class_name = model.names[cls]
                depth = estimate_depth(image, bbox)
                
                detection_data.append({
                    "class": class_name,
                    "confidence": round(conf, 2),
                    "class_id": cls,
                    "bbox": bbox,
                    "estimated_depth": depth,
                    # Don't include uses in initial detection to make it faster
                })

        # REAL-WORLD SIZE ESTIMATION FOR ALL OBJECTS
        for det in detection_data:
            x1, y1, x2, y2 = det["bbox"]
            pixel_width = x2 - x1
            pixel_height = y2 - y1
            
            estimated_width_cm = None
            estimated_height_cm = None
            size_method = "none"
            
            # Method 1: Try using credit card as reference
            width_ratio, height_ratio = estimate_size_using_reference(
                detection_data, "CreditCard", 8.56, 5.4
            )
            
            if width_ratio and height_ratio:
                estimated_width_cm = round(pixel_width * width_ratio, 2)
                estimated_height_cm = round(pixel_height * height_ratio, 2)
                size_method = "reference_object"
            
            # Method 2: Try using depth estimation
            elif det["estimated_depth"] is not None:
                width_cm, height_cm = estimate_size_using_depth(
                    det["estimated_depth"], pixel_width, pixel_height
                )
                if width_cm and height_cm:
                    estimated_width_cm = width_cm
                    estimated_height_cm = height_cm
                    size_method = "depth_based"
            
            # Method 3: Use known average sizes with heuristic scaling
            else:
                width_cm, height_cm = estimate_size_using_known_averages(
                    det["class"], pixel_width, pixel_height, image_width, image_height
                )
                if width_cm and height_cm:
                    estimated_width_cm = width_cm
                    estimated_height_cm = height_cm
                    size_method = "known_average"
            
            det["estimated_width_cm"] = estimated_width_cm
            det["estimated_height_cm"] = estimated_height_cm
            det["size_estimation_method"] = size_method

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
            "timestamp": datetime.now().isoformat(),
            "api_status": {
                "gemini_available": GEMINI_AVAILABLE,
                "depth_available": DEPTH_AVAILABLE
            }
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

@app.route("/get-use-cases", methods=["POST"])
def get_use_cases():
    """Get use cases for detected objects - called when user clicks 'Get Use Cases'"""
    try:
        data = request.get_json()
        
        if not data or 'objects' not in data:
            return jsonify({"error": "No objects provided"}), 400
        
        objects = data['objects']
        
        if not isinstance(objects, list):
            return jsonify({"error": "Objects must be a list"}), 400
        
        if not objects:
            return jsonify({"error": "Empty objects list"}), 400
        
        # Get unique objects to avoid duplicate API calls
        unique_objects = list(set(objects))
        
        print(f"🔍 Getting use cases for {len(unique_objects)} unique objects: {unique_objects}")
        
        # Get use cases from Gemini (with caching)
        use_cases = get_batch_gemini_use_cases(unique_objects)
        
        response_data = {
            "use_cases": use_cases,
            "timestamp": datetime.now().isoformat(),
            "total_objects": len(unique_objects),
            "source": "gemini" if GEMINI_AVAILABLE else "fallback"
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in get-use-cases: {str(e)}")
        return jsonify({"error": f"Failed to get use cases: {str(e)}"}), 500

@app.route("/get-single-use-case", methods=["POST"])
def get_single_use_case():
    """Get use case for a single object"""
    try:
        data = request.get_json()
        
        if not data or 'object' not in data:
            return jsonify({"error": "No object provided"}), 400
        
        object_name = data['object']
        
        print(f"🔍 Getting use case for: {object_name}")
        
        # Get use case from Gemini (with caching)
        use_case = get_gemini_use_cases(object_name)
        
        response_data = {
            "object": object_name,
            "use_case": use_case,
            "timestamp": datetime.now().isoformat(),
            "source": "gemini" if GEMINI_AVAILABLE else "fallback"
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in get-single-use-case: {str(e)}")
        return jsonify({"error": f"Failed to get use case: {str(e)}"}), 500

@app.route("/static/<filename>")
def serve_image(filename):
    try:
        return send_file(os.path.join("static", filename), mimetype="image/jpeg")
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model": "YOLOv8 + DPT depth + real-world size + Gemini",
        "gemini_available": GEMINI_AVAILABLE,
        "depth_available": DEPTH_AVAILABLE,
        "cached_objects": len(gemini_cache),
        "timestamp": datetime.now().isoformat()
    })

# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 Starting Flask server...")
    print(f"🔧 Gemini API Available: {GEMINI_AVAILABLE}")
    print(f"📊 Depth Estimation Available: {DEPTH_AVAILABLE}")
    print(f"📏 Size estimation methods: Reference object, Depth-based, Known averages")
    print(f"🎯 YOLO Model: best.pt")
    print(f"💡 Use Cases: On-demand via /get-use-cases endpoint")
    print(f"💾 Caching: Enabled for Gemini responses")
    print(f"🌐 Server running on http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)