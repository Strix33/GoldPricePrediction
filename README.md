# 🪙 Gold Price Prediction

An end-to-end **machine learning project** that predicts future gold prices using historical data and an **LSTM (Long Short-Term Memory)** deep learning model.  
The project integrates a **Python backend** for AI predictions with an **interactive Next.js frontend** for data visualization and user interaction.

---

## 🚀 Overview

The model analyzes historical gold price data to forecast future values (in ₹ per 10 grams).  
Users can select a target date and investment amount to view **predicted price trends**, **AI-generated forecasts**, and **visual charts** — all powered by a trained LSTM model.

---

## 🧠 Model Details

- **Model Type:** LSTM (Long Short-Term Memory Neural Network)  
- **Input Data:** `Gold Price.csv` (historical gold prices)  
- **Output Unit:** Price in **₹ per 10 grams of gold**  
- **Performance Metrics:**
  - RMSE: **1056.36**
  - RMSE (% of mean price): **2.56%**
  - MAPE: **1.23%**

The model learns temporal dependencies in gold price sequences using 60-day look-back windows to predict future prices.

---

## ⚙️ Backend (Python)

The backend provides an API endpoint that:
- Loads the trained **LSTM model (`gold_lstm.h5`)**  
- Scales input data using the stored **scaler (`scaler.pkl`)**  
- Generates predictions for a user-defined **target date**  
- Returns the results as JSON, including predicted prices and corresponding dates

### 📄 Main Scripts
#### `model.py`
- Trains the LSTM model using Keras & TensorFlow  
- Preprocesses data with `MinMaxScaler`  
- Calculates RMSE and MAPE  
- Saves trained model and scaler

#### `predict_api.py`
- Accepts a **target date** as input  
- Predicts gold prices day-by-day up to that date  
- Rescales outputs to original units (₹/10g)  
- Returns prediction data for visualization

---

## 💻 Frontend (Next.js + Tailwind CSS)

The web interface allows users to:
- Input **investment amount** and **target date**
- Choose between “Exact Graph” and “Summary Only” modes
- View **AI-generated predictions** with interactive graphs  
- Visualize **current and future price trends** using Recharts

### 🖼️ UI Preview
<img width="1220" height="799" alt="image" src="https://github.com/user-attachments/assets/e3af4689-8054-4e80-a045-988e67fc54be" />


---

## 🧩 Tech Stack

**Frontend:**
- Next.js 14
- React 19
- Tailwind CSS 4
- Radix UI, Recharts, Lucide React
- React Hook Form + Zod validation

**Backend / ML:**
- Python 3.x
- TensorFlow / Keras
- NumPy, Pandas, Scikit-learn
- Matplotlib

---


