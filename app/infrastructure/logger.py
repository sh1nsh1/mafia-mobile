from typing import Literal

import colorlog


def get_logger(name: str, level: Literal[10, 20, 30, 40, 50]):
    logger = colorlog.getLogger(name)

    # Добавляем handler только один раз
    if not logger.handlers:
        handler = colorlog.StreamHandler()
        formatter = colorlog.ColoredFormatter(
            "%(log_color)s%(levelname)-7s%(reset)s %(asctime)s %(yellow)s%(name)s: %(white)s%(message)s%(reset)s",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
            datefmt="%H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(level)
    return logger
