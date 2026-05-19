from pydantic import BaseModel
from typing import List


class HealthTipResponse(BaseModel):
    id: int
    title: str
    body: str
    lang: str
