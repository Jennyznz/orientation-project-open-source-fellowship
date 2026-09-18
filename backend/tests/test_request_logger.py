import pytest

from unittest.mock import AsyncMock, MagicMock, patch
from starlette.responses import Response

from app.middleware import RequestLoggingMiddleware


# Test that the middleware creates the correct log message
@pytest.mark.asyncio
async def test_request_logger_logs_request_details():
    # Create middleware with a mock app
    middleware = RequestLoggingMiddleware(app=MagicMock())

    # Create mock request
    request = MagicMock()
    request.method = "GET"
    request.url.path = "/test"

    # Create mock response and call_next function
    response = Response(status_code=200)
    call_next = AsyncMock(return_value=response)

    # Replace the request logger with a mock logger
    with patch("app.middleware.logger") as mock_logger:

        # Run mock request and call_next function
        await middleware.dispatch(request, call_next)

    # Call logger.info() exactly once
    mock_logger.info.assert_called_once()

    # Get the message that was passed to logger.info()
    log_message = mock_logger.info.call_args[0][0]

    # Check that the relevant fields are logged
    assert "GET /test" in log_message
    assert "Status: 200" in log_message
    assert "Duration:" in log_message


# Test that the middleware returns the response produced
@pytest.mark.asyncio
async def test_request_logger_returns_response():
    # Create middleware with a mock app
    middleware = RequestLoggingMiddleware(app=MagicMock())

    # Create a mock request
    request = MagicMock()

    # Create a mock response
    response = Response(status_code=201)

    # Create a mock call_next() function
    call_next = AsyncMock(return_value=response)

    # Replace the logger with a mock
    with patch("app.middleware.logger"):

        # Run the middleware
        result = await middleware.dispatch(request, call_next)

    # Check the middleware returns the exact same response as call_next()
    assert result is response
