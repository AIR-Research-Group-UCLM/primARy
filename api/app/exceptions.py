
class InvalidProtocolException(Exception):
    """Raised when a protocol is rejected because it does not satisfy the rules
    a protocol must follow"""


class InvalidFileException(Exception):
    """Raised when an uploaded file is rejected"""
