from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app) # 1. This allows your React frontend to talk to Python safely
@app.route('/health', methods=['GET'])
def health():
    # Render automatically injects the current commit SHA into this environment variable
    commit_sha = os.environ.get('RENDER_GIT_COMMIT', 'unknown_commit')
    return commit_sha, 200
# Load the saved model and scaler
try:
    model = joblib.load('models/random_forest_champion.pkl')
    scaler = joblib.load('models/scaler.pkl')
except Exception as e:
    model = None
    scaler = None
    print(f"Warning: Machine learning assets failed to load. {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 2. Changed to get_json() to accept React data
        data = request.get_json() 

        # Capture the 9 raw form features with correct column names matching your training data
        input_data = pd.DataFrame([{
            'loan_amount': float(data['loan_amount']),
            'income': float(data['income']),
            'property_value': float(data['property_value']),
            'loan_term': float(data['loan_term']),
            'combined_loan_to_value_ratio': float(data['combined_loan_to_value_ratio']),
            'debt_to_income_ratio': data['debt_to_income_ratio'],
            'loan_type': data['loan_type'],
            'loan_purpose': data['loan_purpose'],
            'applicant_age': data['applicant_age']
        }])

        # Apply get_dummies to match training preprocessing
        categorical_cols = ['loan_type', 'loan_purpose', 'debt_to_income_ratio', 'applicant_age']
        encoded_input = pd.get_dummies(input_data, columns=categorical_cols, drop_first=True)

        # Align columns to match the exact 39 features the scaler expects
        if hasattr(scaler, 'feature_names_in_'):
            encoded_input = encoded_input.reindex(columns=scaler.feature_names_in_, fill_value=0)
        else:
            encoded_input = encoded_input.reindex(columns=model.feature_names_in_, fill_value=0)

        # Scale and Predict
        scaled_features = scaler.transform(encoded_input)
        prediction = model.predict(scaled_features)[0]

        # Map prediction (0 = Denied, 1 = Approved)
        result_text = "Approved" if prediction == 1 else "Denied"
        return jsonify({'prediction': result_text})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # 3. Changed port to 5001 so it doesn't conflict with Node.js
    app.run(debug=True, port=5001)