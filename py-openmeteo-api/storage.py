import json
import os
from typing import Any


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_latest(data_dir: str, payload: dict) -> None:
    _ensure_dir(data_dir)
    latest_path = os.path.join(data_dir, "latest.json")
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def append_log(data_dir: str, payload: dict) -> None:
    _ensure_dir(data_dir)
    logs_path = os.path.join(data_dir, "logs.json")
    logs = []
    if os.path.exists(logs_path):
        try:
            with open(logs_path, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except Exception:
            logs = []
    logs.append(payload)
    with open(logs_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)
