from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api import router as api_router

app = FastAPI(title="Automaton AI Voice Order Confirmation - Advanced")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"status": "Automaton AI Voice System v2 Running", "features": ["Multi-turn AI", "Smart Retry", "Auto Language Detection"]}
