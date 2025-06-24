# FastAPI tools for building APIs and handling file uploads
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware  # To allow frontend to access this backend
import uvicorn  # Runs the FastAPI app
import numpy as np
from io import BytesIO  # To read the uploaded file in memory
from PIL import Image  # For image loading and processing
import tensorflow as tf  # To load and use the trained ML model

# Initialize the FastAPI app
app = FastAPI()

# List of allowed origins (e.g., React frontend running on localhost:3000)
origins = [
    "http://localhost",
    "http://localhost:3000",
]

# Enable Cross-Origin Resource Sharing (CORS) so frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Allowed domains
    allow_credentials=True,
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all headers
)

# Load the saved model (this must match your training code's save path)
MODEL = tf.keras.models.load_model("../saved_models/1.keras")

# The model's output classes (what it's predicting)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# A simple route to test if the API is running
@app.get("/ping")
async def ping():
    return "Hello, I am alive"

# Converts uploaded file bytes to an image array
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))  # Open and convert to NumPy array
    return image

# Endpoint for predicting disease from an uploaded image
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())  # Read and convert the uploaded image
    img_batch = np.expand_dims(image, 0)  # Add batch dimension

    predictions = MODEL.predict(img_batch)  # Run prediction on the image

    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]  # Class with highest score
    confidence = np.max(predictions[0])  # Confidence score of the prediction

    # Return results as a dictionary (FastAPI will convert to JSON)
    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

# Start the server if this file is run directly
if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
