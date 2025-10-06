# =============================
# GOLD PRICE FORECASTING WITH SAVED MODEL
# =============================

import os
import math
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

# =============================
# LOAD DATA
# =============================
file_path = "Gold price.csv"   # put dataset in same folder
df = pd.read_csv(file_path)

df.columns = [col.strip().lower() for col in df.columns]
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date")

data = df[["price"]].values

# =============================
# SCALER
# =============================
scaler_path = "scaler.pkl"
if os.path.exists(scaler_path):
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
else:
    scaler = MinMaxScaler(feature_range=(0,1))
    scaler.fit(data)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

scaled_data = scaler.transform(data)

# =============================
# CREATE SEQUENCES
# =============================
def create_sequences(dataset, look_back=60):
    X, y = [], []
    for i in range(look_back, len(dataset)):
        X.append(dataset[i-look_back:i, 0])
        y.append(dataset[i, 0])
    return np.array(X), np.array(y)

look_back = 60
train_size = int(len(scaled_data) * 0.8)
train_data = scaled_data[:train_size]
test_data  = scaled_data[train_size-look_back:]

X_train, y_train = create_sequences(train_data, look_back)
X_test, y_test   = create_sequences(test_data, look_back)

X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
X_test  = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

# =============================
# MODEL LOAD / TRAIN
# =============================
model_path = "gold_lstm.h5"

if os.path.exists(model_path):
    print("✅ Loading saved model...")
    model = load_model(model_path)
else:
    print("⚡ Training new model...")
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=(look_back, 1)))
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dense(units=1))
    model.compile(optimizer="adam", loss="mean_squared_error")

    model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.1)
    model.save(model_path)
    print("✅ Model saved!")

# =============================
# FORECASTING & ACCURACY
# =============================
predictions = model.predict(X_test)
predictions = scaler.inverse_transform(predictions)
y_test_rescaled = scaler.inverse_transform(y_test.reshape(-1,1))

rmse = math.sqrt(mean_squared_error(y_test_rescaled, predictions))
mape = mean_absolute_percentage_error(y_test_rescaled, predictions) * 100
mean_price = df["price"].mean()
percent_rmse = (rmse / mean_price) * 100

print("\nEvaluation Metrics:")
print("RMSE:", rmse)
print("RMSE (% of mean price):", percent_rmse)
print("MAPE (%):", mape)

# =============================
# VISUALIZE RESULTS
# =============================
train = df[:train_size]
valid = df[train_size:]
valid = valid.copy()
valid["Predictions"] = predictions

plt.figure(figsize=(12,6))
plt.plot(train["date"], train["price"], label="Train Price")
plt.plot(valid["date"], valid["price"], label="Real Price")
plt.plot(valid["date"], valid["Predictions"], label="Predicted Price")
plt.xlabel("Date")
plt.ylabel("Gold Price")
plt.legend()
plt.show()

# =============================
# FORECAST NEXT N DAYS
# =============================
future_days = 10
last_60_days = scaled_data[-look_back:]
X_future = last_60_days.reshape(1, look_back, 1)

future_preds = []
for _ in range(future_days):
    pred = model.predict(X_future, verbose=0)
    future_preds.append(pred[0,0])
    X_future = np.append(X_future[:,1:,:], [[[pred[0,0]]]], axis=1)

future_preds = scaler.inverse_transform(np.array(future_preds).reshape(-1,1))
future_dates = pd.date_range(df["date"].iloc[-1] + pd.Timedelta(days=1), periods=future_days)

forecast_df = pd.DataFrame({"date": future_dates, "forecast_price": future_preds.flatten()})
print("\nNext 10 days forecast:")
print(forecast_df)

# =============================
# FORECAST SPECIFIC DATE
# =============================
target_date = "2025-10-8"
target_date = pd.to_datetime(target_date)

last_date = df["date"].iloc[-1]
days_ahead = (target_date - last_date).days

if days_ahead <= 0:
    print(f"\n⚠️ Target date {target_date.date()} is in the dataset or earlier.")
else:
    print(f"\nForecasting {days_ahead} days into the future...")
    last_60_days = scaled_data[-look_back:]
    X_future = last_60_days.reshape(1, look_back, 1)

    future_preds = []
    for _ in range(days_ahead):
        pred = model.predict(X_future, verbose=0)
        future_preds.append(pred[0,0])
        X_future = np.append(X_future[:,1:,:], [[[pred[0,0]]]], axis=1)

    final_pred = scaler.inverse_transform(np.array(future_preds[-1]).reshape(-1,1))
    print(f"Predicted Gold Price on {target_date.date()}: {final_pred[0,0]:.2f}")
