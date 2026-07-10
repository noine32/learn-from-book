from impl import caesar


def test_caesar():
    assert caesar("abc", 1) == "bcd"
    assert caesar("XYZ", 3) == "ABC"
    assert caesar("Hello, World!", 0) == "Hello, World!"
