import cv2
import numpy as np
from ultralytics import YOLO
from shapely.geometry import Polygon

# Load a lightweight segmentation model for the hackathon MVP
# Ultralytics will auto-download 'yolov8n-seg.pt' the first time this runs.
# Later, you can swap this with a model you fine-tuned on SpaceNet/DeepGlobe.
model = YOLO('yolov8n-seg.pt') 

def process_image(image_bytes: bytes):
    """
    Takes raw image bytes, runs YOLOv8 segmentation, and extracts standard polygons.
    """
    # 1. Convert bytes to a numpy array so OpenCV can read it
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Run YOLOv8 Inference
    # conf=0.25 filters out weak detections
    results = model.predict(img, conf=0.25)
    
    extracted_assets = []
    
    for result in results:
        names = result.names  # Dictionary of class IDs to names (e.g., 0: 'person', 2: 'car')
        
        # Ensure the model actually found masks in the image
        if result.masks is not None:
            # result.masks.xy contains the coordinates of the segmentation boundaries
            for i, (mask_coords, box) in enumerate(zip(result.masks.xy, result.boxes)):
                class_id = int(box.cls[0])
                class_name = names[class_id]
                confidence = float(box.conf[0])
                
                # A valid polygon needs at least 3 points
                if len(mask_coords) >= 3:
                    # Create a Shapely polygon to easily calculate area
                    poly = Polygon(mask_coords)
                    
                    # NOTE: This area is currently in pixels! 
                    # In Phase 2, we will use a pixel-to-meter conversion ratio based on the map zoom level.
                    pixel_area = poly.area 
                    
                    extracted_assets.append({
                        "asset_category": class_name,
                        "confidence_score": round(confidence, 3),
                        "area_sqm": round(pixel_area, 2), 
                        "polygon_points": mask_coords.tolist() # Convert back to standard list for JSON response
                    })
                    
    return extracted_assets