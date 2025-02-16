# Real-Time Fire Detection with YOLO, FastAPI & Next.js: Build Your Own FlameGuard App

## Conda CLI
- [Conda CLI Documentation](https://docs.anaconda.com/navigator/tutorials/manage-environments/)

### Conda Environment Management
```bash
conda env list
# In backend directory
conda create -n flameguard python=3.9 --file requirements.txt
conda activate flameguard
conda deactivate
conda env remove --name flameguard
```

## YOLO
- [YOLO Official Website](https://www.ultralytics.com/)
- [YOLO 11 Documentation](https://docs.ultralytics.com/models/yolo11/)

## Roboflow
- [Roboflow Website](https://roboflow.com/)
- [Roboflow Universe](https://universe.roboflow.com/)

### YOLO Training Method
1. Find a training dataset on Universe
2. Download the training dataset
3. Train with the downloaded dataset
4. Copy the `best.pt` file
5. Add the copied `best.pt` file to the project
6. Use the `best.pt` file added to the project
7. Test with the `best.pt` file

## Backend

### FastAPI

#### Run
```bash
cd backend/app
```

```bash
fastapi dev main.py
```

or 

```bash
uvicorn main:app --reload
```

### API Structure

```
app/
 ├── main.py
 ├── api/
 │   ├── create_user/         # 🟡 endpoint: POST /users
 │   │   ├── router.py        # API router
 │   │   ├── schema.py        # Pydantic response/request schema
 │   │   ├── crud.py          # DB related logic
 │   ├── update_user/         # 🟡 endpoint: PUT /users/{id}
 │   │   ├── router.py
 │   │   ├── schema.py
 │   │   ├── crud.py
 │   ├── get_users/           # 🟡 endpoint: GET /users
 │   │   ├── router.py
 │   │   ├── schema.py
 │   │   ├── crud.py
 │   ├── delete_user/         # 🟡 endpoint: DELETE /users/{id}
 │   │   ├── router.py
 │   │   ├── schema.py
 │   │   ├── crud.py
 │   ├── share_crud.py        # 🟡 DB related share logic
 │   ├── share_schema.py      # 🟡 Pydantic share response/request schema
```

## Frontend
```bash
pnpm install
pnpm run dev
```
