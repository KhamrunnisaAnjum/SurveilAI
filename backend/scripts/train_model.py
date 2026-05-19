import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

np.random.seed(42)
n_samples = 500

data = {
    "age": np.random.randint(1, 90, n_samples),
    "gender": np.random.choice([0, 1], n_samples),
    "heart_rate": np.random.randint(50, 130, n_samples),
    "spo2": np.random.randint(80, 100, n_samples),
    "temperature": np.random.uniform(35, 40, n_samples),
    "bp_systolic": np.random.randint(80, 180, n_samples),
    "bp_diastolic": np.random.randint(50, 110, n_samples),
    "respiratory_rate": np.random.randint(10, 30, n_samples),
    "admission_days": np.random.randint(0, 30, n_samples),
    "severity": np.random.uniform(0, 10, n_samples),
}

df = pd.DataFrame(data)

risk_score = (
    (df["age"] > 60).astype(int) * 10 +
    (df["spo2"] < 95).astype(int) * 25 +
    (df["temperature"] > 38).astype(int) * 20 +
    (df["bp_systolic"] > 140).astype(int) * 15 +
    (df["heart_rate"] > 100).astype(int) * 10 +
    (df["respiratory_rate"] > 22).astype(int) * 10 +
    df["severity"] * 2
)
y = (risk_score > 50).astype(int)

X = df.values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2%}")

os.makedirs("models", exist_ok=True)
joblib.dump({"model": model, "feature_names": list(df.columns)}, "models/risk_model.pkl")
print("Model saved to models/risk_model.pkl")
