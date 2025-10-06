import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model

def predict_date_range(target_date_str):
    file_path = "Gold Price.csv"
    df = pd.read_csv(file_path)
    
    df.columns = [col.strip().lower() for col in df.columns]
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    
    data = df[["price"]].values
    
    scaler_path = "scaler.pkl"
    if not os.path.exists(scaler_path):
        return {"error": "Scaler not found"}
    
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    
    scaled_data = scaler.transform(data)
    
    model_path = "gold_lstm.h5"
    if not os.path.exists(model_path):
        return {"error": "Model not found"}
    
    model = load_model(model_path)
    
    target_date = pd.to_datetime(target_date_str)
    last_date = df["date"].iloc[-1]
    
    days_to_predict = (target_date - last_date).days
    
    if days_to_predict <= 0:
        return {"error": f"Target date must be after {last_date.strftime('%Y-%m-%d')}"}
    
    look_back = 60
    last_60_days = scaled_data[-look_back:]
    X_future = last_60_days.reshape(1, look_back, 1)
    
    predictions = []
    prediction_dates = []
    
    for i in range(days_to_predict):
        pred = model.predict(X_future, verbose=0)
        predictions.append(pred[0, 0])
        
        next_date = last_date + timedelta(days=i+1)
        prediction_dates.append(next_date.strftime("%Y-%m-%d"))
        
        X_future = np.append(X_future[:, 1:, :], [[[pred[0, 0]]]], axis=1)
    
    predictions_rescaled = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
    
    result = []
    for date_str, price in zip(prediction_dates, predictions_rescaled.flatten()):
        result.append({
            "date": date_str,
            "price": float(price)
        })
    
    return {
        "success": True,
        "predictions": result,
        "last_historical_date": last_date.strftime("%Y-%m-%d"),
        "target_date": target_date.strftime("%Y-%m-%d")
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Target date required"}))
        sys.exit(1)
    
    target_date = sys.argv[1]
    result = predict_date_range(target_date)
    print(json.dumps(result))
