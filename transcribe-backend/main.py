from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Transcribe API is live"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Dummy transcription logic
    file_content = await file.read()
    file_size = len(file_content)

    return JSONResponse(content={
        "filename": file.filename,
        "size_bytes": file_size,
        "transcription": f"Dummy transcription for file '{file.filename}'"
    })
