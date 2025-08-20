# CORS Configuration for Backend API

If you prefer to configure CORS on your backend instead of using the Vite proxy, here are the configurations for different backend frameworks:

## FastAPI (Python)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Express.js (Node.js)
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Flask (Python)
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'])
```

## Django (Python)
Add to settings.py:
```python
# Install django-cors-headers first: pip install django-cors-headers

INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

MIDDLEWARE = [
    # ... other middleware
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
]

CORS_ALLOW_CREDENTIALS = True
```

## ASP.NET Core (C#)
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            builder =>
            {
                builder.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseCors("AllowFrontend");
    // ... other middleware
}
```

If you use this approach, update your .env.local file to:
```
VITE_API_BASE_URL=http://localhost:5000
```
