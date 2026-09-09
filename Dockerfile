# 1. Use a lightweight Python base image
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy your grocery list first (to optimize caching)
COPY requirements.txt .

# 4. Install all the libraries from your list
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your project files (app.py, models, templates)
COPY . .

# 6. Expose the port Flask runs on
EXPOSE 5000

# 7. Command to start the Flask server
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]