# Real-Time Fire Detection with YOLO, FastAPI & Next.js: Build Your Own FlameGuard App




# conda cli
https://docs.anaconda.com/navigator/tutorials/manage-environments/




# conda 가상환경 관리
conda env list
conda create -n flameguard python=3.9
conda activate flameguard
conda deactivate
conda env remove --name flameguard






# yolo
https://www.ultralytics.com/


### yolo 11 documentation
https://docs.ultralytics.com/models/yolo11/

### roboflow
https://roboflow.com/

### roboflow universe
https://universe.roboflow.com/


### yolo 학습방법
1. universe에서 학습데이터셋 찾기
2. 학습데이터셋 다운로드
3. 다운로드 받은 학습데이터셋으로 학습
4. best.pt 파일복사
5. 복사한 best.pt 파일을 프로젝트에 추가
6. 프로젝트에 추가한 best.pt 파일을 사용
7. best.pt파일로 테스트




# backend

## FastAPI

### run
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




## API structure

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
 




# frontend