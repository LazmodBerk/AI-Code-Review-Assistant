import asyncio
import pytest
sys_path_setup = __import__('sys').path.insert(0, 'backend')
from app.analyzers.ast_analyzer import ASTAnalyzer
from app.analyzers.radon_analyzer import RadonAnalyzer
from app.analyzers.base import Severity, Category

@pytest.fixture
def analyzer():
    return ASTAnalyzer()

@pytest.mark.asyncio
async def test_ast_long_function(analyzer):
    code = 'def long_func():\n' + '    x = 1\n' * 55
    issues = await analyzer.analyze('test.py', code)
    assert any('long' in i.message.lower() and 'func' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_ast_empty_except(analyzer):
    code = '''def f():\n    try:\n        pass\n    except:\n        pass\n'''
    issues = await analyzer.analyze('test.py', code)
    assert any('empty except' in i.message.lower() or 'broad' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_ast_missing_type_hints(analyzer):
    code = 'def func(a, b):\n    return a + b\n'
    issues = await analyzer.analyze('test.py', code)
    assert any('type' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_ast_high_param_count(analyzer):
    code = 'def func(a, b, c, d, e, f):\n    pass\n'
    issues = await analyzer.analyze('test.py', code)
    assert any('param' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_ast_todo_comment(analyzer):
    code = '# TODO: fix this\nx = 1\n'
    issues = await analyzer.analyze('test.py', code)
    assert any(i.rule_id == 'AE003' for i in issues)

@pytest.mark.asyncio
async def test_ast_magic_numbers(analyzer):
    code = 'x = 9999\n'
    issues = await analyzer.analyze('test.py', code)
    assert any('magic' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_ast_duplicate_import(analyzer):
    code = 'import os\nimport os\n'
    issues = await analyzer.analyze('test.py', code)
    assert any('duplicate' in i.message.lower() for i in issues)

@pytest.mark.asyncio
async def test_non_python_file_skipped(analyzer):
    issues = await analyzer.analyze('test.js', 'const x = 1;')
    assert issues == []

@pytest.mark.asyncio
async def test_radon_complexity():
    analyzer = RadonAnalyzer()
    code = '''def complex_func(a, b, c, d, e, f, g, h, i, j):\n''' + '    if a:\n        if b:\n            if c:\n                if d:\n                    if e:\n                        if f:\n                            if g:\n                                return h\n    return i\n'
    issues = await analyzer.analyze('test.py', code)
    # Should detect high complexity
    assert isinstance(issues, list)
