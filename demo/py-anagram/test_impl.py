from impl import is_anagram


def test_is_anagram():
    assert is_anagram("listen", "silent") is True
    assert is_anagram("Hello", "olleh") is True
    assert is_anagram("abc", "abd") is False
