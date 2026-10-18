# Use a lightweight Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependency list and install them
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Copy the rest of your application code and models
COPY . .

# Expose the port your Python app runs on (usually 5000 for Flask)
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]