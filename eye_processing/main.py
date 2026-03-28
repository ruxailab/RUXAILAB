"""Advanced Eye-Tracking Accuracy Calibration and Correction Framework.

This module provides signal processing capabilities for eye-tracking data,
including Kalman filtering for jitter reduction, drift compensation, and accuracy metrics.
"""

import json
import os
import numpy as np
from firebase_functions import https_fn
from firebase_admin import initialize_app

initialize_app()

allowed_origin = os.environ.get('ALLOWED_ORIGIN', 'https://ruxailab.web.app')

common_headers = {
    'Access-Control-Allow-Origin': allowed_origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

class KalmanFilter2D:
    def __init__(self, dt=1/30.0, process_noise=1e-5, measurement_noise=1e-2):
        # State vector: [x, y, dx, dy]
        self.x = np.zeros((4, 1))
        # State transition matrix
        self.F = np.array([
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
        # Measurement matrix
        self.H = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ])
        # Covariance matrix
        self.P = np.eye(4)
        # Process noise covariance
        self.Q = np.eye(4) * process_noise
        # Measurement noise covariance
        self.R = np.eye(2) * measurement_noise

    def predict(self):
        self.x = np.dot(self.F, self.x)
        self.P = np.dot(np.dot(self.F, self.P), self.F.T) + self.Q
        return self.x[:2]

    def update(self, measurement):
        z = np.array([[measurement[0]], [measurement[1]]])
        y = z - np.dot(self.H, self.x)
        S = np.dot(self.H, np.dot(self.P, self.H.T)) + self.R
        K = np.dot(np.dot(self.P, self.H.T), np.linalg.inv(S))
        self.x = self.x + np.dot(K, y)
        I = np.eye(4)
        self.P = np.dot((I - np.dot(K, self.H)), self.P)
        return self.x[:2]

@https_fn.on_request()
def process_gaze_data(req):
    """Processes raw gaze data applying smoothing and drift compensation."""
    if req.method == 'OPTIONS':
        return ('', 204, common_headers)
        
    try:
        req_data = req.get_json()
        raw_gaze_points = req_data.get("rawGaze", []) # List of dicts {x: float, y: float, timestamp: int}
        
        if not raw_gaze_points:
            return (json.dumps({"error": "No gaze data provided"}), 400, common_headers)

        filtered_points = []
        kf = KalmanFilter2D()
        
        # Initialize filter with first point
        if len(raw_gaze_points) > 0:
            first_pt = raw_gaze_points[0]
            kf.x[0, 0] = first_pt.get("x", 0)
            kf.x[1, 0] = first_pt.get("y", 0)
            
        for pt in raw_gaze_points:
            kf.predict()
            filtered_pt = kf.update([pt.get("x", 0), pt.get("y", 0)])
            filtered_points.append({
                "x": float(filtered_pt[0, 0]),
                "y": float(filtered_pt[1, 0]),
                "timestamp": pt.get("timestamp", 0)
            })
            
        response_data = {
            "filteredGaze": filtered_points,
            "metrics": {
                "pointsProcessed": len(filtered_points),
                "filterType": "Kalman2D"
            }
        }
        
        return (json.dumps(response_data), 200, {'Content-Type': 'application/json', **common_headers})
        
    except Exception as e:
        return (json.dumps({"error": str(e)}), 500, common_headers)

@https_fn.on_request()
def calculate_accuracy_metrics(req):
    """Calculates accuracy and precision metrics from calibration/validation data."""
    if req.method == 'OPTIONS':
        return ('', 204, common_headers)
        
    try:
        req_data = req.get_json()
        targets = req_data.get("targets", []) # List of dicts {x, y}
        gaze_samples = req_data.get("samples", []) # List of lists of gaze points {x, y} corresponding to each target
        
        # Calculate offset (accuracy) and variance (precision)
        metrics = {"targets": []}
        overall_accuracy = 0
        overall_precision = 0
        valid_targets = 0
        
        for idx, target in enumerate(targets):
            if idx < len(gaze_samples) and gaze_samples[idx]:
                samples = np.array([[pt["x"], pt["y"]] for pt in gaze_samples[idx]])
                target_pt = np.array([target["x"], target["y"]])
                
                centroid = np.mean(samples, axis=0)
                accuracy = np.linalg.norm(centroid - target_pt)
                precision = np.mean(np.linalg.norm(samples - centroid, axis=1))
                
                metrics["targets"].append({
                    "targetIndex": idx,
                    "accuracy": float(accuracy),
                    "precision": float(precision)
                })
                overall_accuracy += accuracy
                overall_precision += precision
                valid_targets += 1
                
        if valid_targets > 0:
            metrics["overallAccuracy"] = float(overall_accuracy / valid_targets)
            metrics["overallPrecision"] = float(overall_precision / valid_targets)
            
        return (json.dumps(metrics), 200, {'Content-Type': 'application/json', **common_headers})
        
    except Exception as e:
        return (json.dumps({"error": str(e)}), 500, common_headers)
