import base64
import cv2
import numpy as np

from insightface.app import FaceAnalysis


# Model will NOT load when Django starts
face_app = None


def get_face_app():

    global face_app

    if face_app is None:

        print("Loading InsightFace model...")

        face_app = FaceAnalysis(
            name="buffalo_l"
        )

        face_app.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        print("InsightFace model loaded.")

    return face_app


def image_from_base64(base64_image):

    if "," in base64_image:
        base64_image = base64_image.split(
            ",",
            1
        )[1]

    image_bytes = base64.b64decode(
        base64_image
    )

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    return image


def get_face_embedding(base64_image):

    image = image_from_base64(
        base64_image
    )

    if image is None:
        raise ValueError(
            "Invalid image."
        )

    # Load model only when recognition is needed
    app = get_face_app()

    faces = app.get(image)

    if len(faces) == 0:
        raise ValueError(
            "No face detected."
        )

    if len(faces) > 1:
        raise ValueError(
            "Multiple faces detected."
        )

    face = faces[0]

    embedding = face.embedding

    return embedding
