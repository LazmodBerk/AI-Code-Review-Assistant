import asyncio
import pytest
from httpx import AsyncClient
from httpx import ASGITransport
import sys
sys.path.insert(0, 'backend')

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def client():
    from main import app
    from app.core.database import init_db
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.fixture
def sample_python_code():
    return '''
import os
import os  # duplicate

def bad_function(a, b, c, d, e, f, g):  # too many params
    for i in range(10):
        for j in range(10):
            for k in range(10):
                for l in range(10):  # deep nesting
                    if i == 42:  # magic number
                        pass
    try:
        result = eval(a)  # security issue
    except:  # broad + empty
        pass
    # TODO: fix this later
    return result
'''
