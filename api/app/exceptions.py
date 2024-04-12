
class InvalidProtocolException(Exception):
    """Raised when a protocol is rejected because it does not satisfy the rules
    a protocol must follow"""


class InvalidFileException(Exception):
    """Raised when an uploaded file is rejected"""


class LLMServiceException(Exception):
    """Raised when something wrong happens while interacting with the LLM service"""
