
class InvalidDocumentException(Exception):
    """Raised when an uploaded document is rejected"""


class LLMNotAvailableException(Exception):
    """Raised when someone queries the LLM but it is in the process of generating an answer"""
