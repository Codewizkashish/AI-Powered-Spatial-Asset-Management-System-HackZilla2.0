import cv2
import numpy as np
from ultralytics import YOLO

print("🧠 Initializing Dual-AI Spatial Engine...")

# ---------------------------------------------------------
# LOAD MODELS GLOBALLY
# ---------------------------------------------------------
try:
    satellite_model = YOLO('best.pt')         # Custom Model: Infrastructure & Terrain
    vehicle_model = YOLO('yolov8n-seg.pt')    # Pre-trained Model: Traffic & Humans
except Exception as e:
    print(f"⚠️ Warning: Model loading failed. Ensure best.pt and yolov8n-seg.pt are in the root folder. Error: {e}")

# Strict jurisdictions to prevent AI conflicts. Use lowercase.
SATELLITE_JURISDICTION = {"building", "water", "tree", "forest", "farmland", "tin_shade"}
VEHICLE_JURISDICTION = {"car", "bus", "truck", "motorcycle", "person", "train"}

def calculate_area(polygon_points):
    """Calculates pixel area using OpenCV."""
    if len(polygon_points) < 3: 
        return 0.0
    contour = np.array(polygon_points, dtype=np.float32)
    return float(cv2.contourArea(contour))

def process_image(image_bytes):
    """
    Takes raw image bytes, runs BOTH AI models, and merges the results safely.
    """
    try:
        # 1. Decode the image bytes 
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image bytes.")

        # ---------------------------------------------------------
        # 2. THE COLOR FIX (DO NOT REMOVE THIS!)
        # ---------------------------------------------------------
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        all_detections = []

        # ---------------------------------------------------------
        # BRAIN 1: SATELLITE ENGINE (Infrastructure & Nature)
        # ---------------------------------------------------------
        sat_results = satellite_model(img, stream=True, verbose=False, conf=0.25) 
        
        for r in sat_results:
            if r.masks is None:
                continue 
                
            for i, mask in enumerate(r.masks.xy):
                raw_label = r.names[int(r.boxes.cls[i])].lower()
                
                if raw_label in SATELLITE_JURISDICTION:
                    
                    # ---> THE UI TRANSLATOR <---
                    ui_translator = {
                        "building": "Building",
                        "water": "Water Body",
                        "tree": "Tree",
                        "forest": "Park",       # Map forest to Park
                        "farmland": "Park",     # Map farmland to Park
                        "tin_shade": "Building" # Map tin shades to Building
                    }
                    
                    # Get the matching UI string, default to capitalized if not found
                    final_label = ui_translator.get(raw_label, raw_label.capitalize())

                    all_detections.append({
                        "asset_category": final_label, # Use the translated label here!
                        "confidence_score": round(float(r.boxes.conf[i]), 3),
                        "area_sqm": calculate_area(mask),
                        "polygon_points": mask.tolist()
                    })

        # ---------------------------------------------------------
        # BRAIN 2: VEHICLE ENGINE (Traffic & Pedestrians)
        # ---------------------------------------------------------
        veh_results = vehicle_model(img, stream=True, verbose=False, conf=0.25) 
        for r in veh_results:
            if r.masks is None:
                continue
                
            for i, mask in enumerate(r.masks.xy):
                label = r.names[int(r.boxes.cls[i])].lower()
                
                if label in VEHICLE_JURISDICTION:
                    all_detections.append({
                        "asset_category": label.capitalize(),
                        "confidence_score": round(float(r.boxes.conf[i]), 3),
                        "area_sqm": calculate_area(mask),
                        "polygon_points": mask.tolist()
                    })

        return all_detections

    except Exception as e:
        print(f"❌ Vision Engine Error: {str(e)}")
        return []