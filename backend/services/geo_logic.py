import uuid

def generate_warnings(detected_assets):
    """
    Analyzes detected assets and generates risk warnings.
    Updated to use UUIDs so the frontend map can place warning markers exactly on the polygons.
    """
    warnings = []
    
    for asset in detected_assets:
        category = str(asset.get("asset_category", "")).lower()
        area = asset.get("area_sqm", 0)
        
        # The frontend needs this to pin the warning to the map
        asset_id = asset.get("id", str(uuid.uuid4())) 
        
        warning_base = {
            "id": str(uuid.uuid4()),
            "asset_id": asset_id,
            "created_at": "2026-05-14T12:00:00Z" # You can make this dynamic later
        }

        # 1. Real YOLO object rules (For your live demo!)
        if category in ["car", "bus", "truck"]:
            warnings.append({
                **warning_base,
                "issue_type": "Unauthorized Vehicle Intrusion",
                "severity": "High",
                "description": f"Vehicle detected in restricted zone."
            })
            
        elif category == "person":
            warnings.append({
                **warning_base,
                "issue_type": "Human Track Trespassing",
                "severity": "Critical",
                "description": "Pedestrian detected on or near active railway lines."
            })

        # 2. Satellite rules (If you use a custom model later)
        elif category in ["water body", "river"] and area > 1000: 
            warnings.append({**warning_base, "issue_type": "High Waterlogging Risk", "severity": "High"})
            
        elif category in ["building", "properties"]:
            warnings.append({**warning_base, "issue_type": "Potential Encroachment", "severity": "High"})

    return warnings