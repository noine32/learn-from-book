from impl import word_frequency


def test_word_frequency():
    assert word_frequency("a b a") == {"a": 2, "b": 1}
    assert word_frequency("one one one") == {"one": 3}
    assert word_frequency("") == {}
