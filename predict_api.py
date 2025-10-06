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
    current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if target_date <= pd.Timestamp(current_date):
        return {"error": "Target date must be in the future"}
    
    look_back = 60
    last_60_days = scaled_data[-look_back:]
    X_future = last_60_days.reshape(1, look_back, 1)
    
    days_from_last_to_target = (target_date - last_date).days
    days_from_last_to_current = (current_date - last_date.to_pydatetime()).days
    days_from_current_to_target = (target_date - pd.Timestamp(current_date)).days
    
    all_predictions = []
    all_dates = []
    
    for i in range(days_from_last_to_target):
        pred = model.predict(X_future, verbose=0)
        all_predictions.append(pred[0, 0])
        
        next_date = last_date + timedelta(days=i+1)
        all_dates.append(next_date)
        
        X_future = np.append(X_future[:, 1:, :], [[[pred[0, 0]]]], axis=1)
    
    all_predictions_rescaled = scaler.inverse_transform(np.array(all_predictions).reshape(-1, 1))
    
    current_price_index = max(0, days_from_last_to_current - 1)
    current_price = float(all_predictions_rescaled[current_price_index, 0]) if current_price_index < len(all_predictions_rescaled) else float(all_predictions_rescaled[-1, 0])
    
    result = []
    for i in range(days_from_last_to_current, days_from_last_to_target):
        if i < len(all_dates):
            result.append({
                "date": all_dates[i].strftime("%Y-%m-%d"),
                "price": float(all_predictions_rescaled[i, 0])
            })
    
    return {
        "success": True,
        "predictions": result,
        "current_price": current_price,
        "current_date": current_date.strftime("%Y-%m-%d"),
        "target_date": target_date.strftime("%Y-%m-%d")
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Target date required"}))
        sys.exit(1)
    
    target_date = sys.argv[1]
    result = predict_date_range(target_date)
    print(json.dumps(result))
