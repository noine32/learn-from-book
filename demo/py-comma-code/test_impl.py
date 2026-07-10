from impl import comma_code


def test_comma_code():
    assert comma_code(["apples", "bananas", "tofu", "cats"]) == "apples, bananas, tofu, and cats"
    assert comma_code(["x"]) == "x"
    assert comma_code([]) == ""
